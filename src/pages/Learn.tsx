import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Box, Brain, Heart, Home, LogIn, LogOut, Menu, Sparkles, Sun } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import WaveVisualization from "@/components/learn/WaveVisualization";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AIMonitor from "@/components/learn/AIMonitor";
import ContentCard from "@/components/learn/ContentCard";
import SubtopicSidebar from "@/components/learn/SubtopicSidebar";
import BottomActionBar from "@/components/learn/BottomActionBar";
import AudioSummaryModal from "@/components/learn/AudioSummaryModal";
import VideoModal from "@/components/learn/VideoModal";
import SocraticTutorModal from "@/components/learn/SocraticTutorModal";
import QuizModal from "@/components/learn/QuizModal";
import WaveGameModal from "@/components/learn/WaveGameModal";
import { defaultLessonChapter, lessonChapters } from "@/lib/lessonData";
import { getSectionMedia } from "@/lib/lessonMedia";
import { useAuth } from "@/lib/auth";
import { useFocusTracker } from "@/hooks/useFocusTracker";
import { useLearnerProgress, useRecordActivity, useRefreshProgress } from "@/hooks/useLearnerProgress";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { shouldSuggestRelax } from "@/lib/focusAnalysis";
import {
  loadCompletedChapters,
  readGuestRelaxPreference,
  saveChapterCompleted,
  saveGuestRelaxPreference,
} from "@/lib/learnerProgress";

const SUGGESTION_COOLDOWN_MS = 120_000;
/** A subtopic counts as read after this long on screen. */
const READ_AFTER_MS = 20_000;

export default function Learn() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading, displayName, updateProfile, signOut } = useAuth();
  const chapter = lessonChapters.find((item) => item.id === chapterId) ?? defaultLessonChapter;
  const tracker = useFocusTracker();
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get("section");
  const requestedPage = Math.min(chapter.sections.length - 1, Math.max(0, Number.parseInt(sectionParam ?? "0", 10) || 0));
  const [page, setPage] = useState(requestedPage);
  const [relaxMode, setRelaxMode] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const lastSuggestion = useRef(0);
  const record = useRecordActivity();
  const refreshProgress = useRefreshProgress();
  const { activities } = useLearnerProgress();
  const firstName = displayName.split(" ")[0];
  const greetName = user ? `, ${firstName}` : "";
  const section = chapter.sections[page] ?? chapter.sections[0];
  const subtopics = chapter.sections.map((_, index) => `Subtopic ${chapter.chapterNumber}.${index + 1}`);
  const media = getSectionMedia(chapter.id, page);
  const subtopicLabel = `${subtopics[page] ?? subtopics[0]}: ${relaxMode ? section.simpleTitle : section.title}`;
  const transcript = useMemo(
    () => chapter.sections.map((item) => (relaxMode ? `${item.simpleTitle}${/[.!?]$/.test(item.simpleTitle) ? "" : "."} ${item.simpleContent}` : item.content.split("\n")[0])),
    [chapter, relaxMode],
  );
  const chapterMenu = (
    <SubtopicSidebar
      topicTitle={chapter.title}
      subtopics={subtopics}
      activeIndex={page}
      onSelect={(index) => { setPage(index); setMenuOpen(false); }}
    />
  );

  // Each learner opens lessons in the mode they last chose.
  useEffect(() => {
    setPage(requestedPage);
    if (loading) return;
    setRelaxMode(user ? !!profile?.prefers_relax_mode : readGuestRelaxPreference());
  }, [chapter.id, loading, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tutor citations link to a subtopic with ?section=N.
  useEffect(() => {
    if (sectionParam !== null) setPage(requestedPage);
  }, [sectionParam]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    loadCompletedChapters(user?.id ?? null).then((ids) => {
      if (!cancelled) setCompleted(ids.includes(chapter.id));
    });
    return () => { cancelled = true; };
  }, [chapter.id, loading, user?.id]);

  // Count real study time and subtopics read for this learner.
  useStudyTimer((seconds) => { void record({ kind: "study", chapterId: chapter.id, durationSeconds: seconds }); });
  const alreadyRead = activities.some((a) => a.kind === "section_read" && a.chapterId === chapter.id && a.sectionIndex === page);
  useEffect(() => {
    if (loading || alreadyRead) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") void record({ kind: "section_read", chapterId: chapter.id, sectionIndex: page });
    }, READ_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [chapter.id, page, loading, alreadyRead, record]);

  const openVideo = () => {
    setShowVideo(true);
    void record({ kind: "video", chapterId: chapter.id, sectionIndex: page });
  };

  const changeRelaxMode = useCallback((on: boolean) => {
    setRelaxMode(on);
    if (user) updateProfile({ prefers_relax_mode: on }).catch(() => toast.error("Couldn't save your Relax Mode choice."));
    else saveGuestRelaxPreference(on);
  }, [user, updateProfile]);

  // Suggest Relax Mode when the camera sees this learner's focus dropping.
  const suggestEnabled = user ? profile?.suggest_relax_on_low_focus ?? true : true;
  useEffect(() => {
    const metrics = tracker.metrics;
    if (relaxMode || !suggestEnabled || !metrics) return;
    const now = performance.now();
    if (!shouldSuggestRelax(metrics.lowFocusSince, now) || now - lastSuggestion.current < SUGGESTION_COOLDOWN_MS) return;
    lastSuggestion.current = now;
    toast(user ? `${firstName}, want to slow down?` : "Want to slow down?", {
      description: "Your focus has dipped for a little while. Relax Mode tells this chapter as a simple story.",
      action: { label: "Switch to Relax Mode", onClick: () => changeRelaxMode(true) },
      duration: 12_000,
    });
  }, [tracker.metrics, relaxMode, suggestEnabled, firstName, changeRelaxMode]);

  const markCompleted = async () => {
    try {
      await saveChapterCompleted(user?.id ?? null, chapter.id);
      setCompleted(true);
      refreshProgress();
      toast.success(`Lesson completed — wonderful work${greetName}!`);
    } catch {
      toast.error("Couldn't save your progress. Please try again.");
    }
  };

  const handleSignOut = async () => {
    tracker.stop();
    await signOut();
    navigate("/login");
  };

  return (
    <div className={`lesson-reference ${relaxMode ? "lesson-relaxed" : "lesson-normal"}`}>
      <header className="lesson-nav">
        <Link to="/topics" className="lesson-brand">AnuJnana</Link>
        <Button variant="ghost" asChild><Link to="/dashboard">Dashboard</Link></Button>
        <Button variant="ghost" asChild><Link to="/topics">Topics</Link></Button>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:inline">{displayName}</span>
          <Button
            variant="outline"
            size="sm"
            aria-pressed={relaxMode}
            aria-label={relaxMode ? "Normal mode" : "Relax Mode"}
            onClick={() => changeRelaxMode(!relaxMode)}
          >
            <Sun className="h-4 w-4" />
            <span className="lesson-relax-label">{relaxMode ? "Normal mode" : "Relax Mode"}</span>
          </Button>
          {user ? (
            <Button variant="ghost" size="sm" aria-label="Log out" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /><span className="lesson-relax-label">Log out</span>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login" aria-label="Log in"><LogIn className="h-4 w-4" /><span className="lesson-relax-label">Log in</span></Link>
            </Button>
          )}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open subtopics"><Menu /></Button>
            </SheetTrigger>
            <SheetContent className="pt-12">{chapterMenu}</SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="lesson-title-band">
        <Button asChild size="sm" className="lesson-back"><Link to="/topics"><ArrowLeft />Back</Link></Button>
        <h1>
          {relaxMode
            ? <><Sparkles className="inline h-5 w-5" /> {chapter.title} - A Simple Story</>
            : `Introduction to ${chapter.title}`}
        </h1>
      </div>

      <div className="lesson-body">
        {relaxMode && (
          <>
            <div className="relax-announcement">
              <h2><Sun className="h-5 w-5" />Relax Mode Activated{greetName}!</h2>
              <p>Take your time with these simplified explanations. No pressure!</p>
              <p className="relax-saved-note">
                {user ? "We'll remember Relax Mode for your account next time." : "Log in to keep Relax Mode on for your own account."}
              </p>
            </div>
            <details className="lesson-camera-disclosure" open={tracker.camState === "on" || undefined}>
              <summary>AI Monitor &amp; camera</summary>
              <AIMonitor tracker={tracker} />
            </details>
          </>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lesson-columns">
          {!relaxMode && (
            <aside className="lesson-monitor">
              <AIMonitor tracker={tracker} />
            </aside>
          )}
          <main className="lesson-reading">
            {relaxMode ? (
              <article className="relax-story">
                <div className="flex items-start justify-between gap-3">
                  <h2><Box className="inline h-6 w-6 text-primary" /> {section.simpleTitle}</h2>
                  <div className="flex shrink-0 gap-1">
                    <Sun className="story-symbol" />
                    <Heart className="story-symbol" />
                    <Home className="story-symbol" />
                  </div>
                </div>
                <p>{section.simpleContent}</p>
                <div className="simple-analogy">
                  <h3><BookOpen className="h-5 w-5" />Simple Analogy:</h3>
                  <p>{section.analogy}</p>
                </div>
              </article>
            ) : (
              <ContentCard
                title={section.title}
                content={section.content}
                currentPage={page + 1}
                totalPages={chapter.sections.length}
                onPrevious={() => setPage((value) => Math.max(0, value - 1))}
                onNext={() => setPage((value) => Math.min(chapter.sections.length - 1, value + 1))}
              />
            )}
          </main>
          <aside className="lesson-visual">
            <WaveVisualization
              key={`${chapter.id}-${page}`}
              title={media.string.title}
              description={relaxMode ? section.analogy : media.string.description}
              well={media.string.well}
              initialLevel={media.string.level}
            />
          </aside>
        </motion.div>
        {relaxMode && (
          <div className="relax-pagination">
            <Button variant="ghost" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button>
            <span>{page + 1} / {chapter.sections.length}</span>
            <Button variant="ghost" disabled={page === chapter.sections.length - 1} onClick={() => setPage((value) => Math.min(chapter.sections.length - 1, value + 1))}>Next</Button>
          </div>
        )}
      </div>

      {relaxMode && (
        <div className="professor-note">
          <BookOpen className="h-10 w-10 shrink-0" />
          <div><strong>Professor says:</strong><p>“You’re doing great{greetName}! Take it one step at a time!”</p></div>
        </div>
      )}
      <BottomActionBar
        isRelaxMode={relaxMode}
        completed={completed}
        onAudioSummary={() => setShowAudio(true)}
        onWatchVideo={openVideo}
        onTakeQuiz={() => setShowQuiz(true)}
        onAskDoubt={() => setShowTutor(true)}
        onPlayGame={() => setShowGame(true)}
        onToggleRelax={() => changeRelaxMode(false)}
        onCompleted={markCompleted}
      />
      <AudioSummaryModal
        isOpen={showAudio}
        onClose={() => setShowAudio(false)}
        title={relaxMode ? `${chapter.title} — A Simple Story` : `${chapter.title} — Audio Summary`}
        transcript={transcript}
        startLine={page}
        onStart={() => { void record({ kind: "story", chapterId: chapter.id, sectionIndex: page }); }}
      />
      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} subtopic={subtopicLabel} videos={media.videos} />
      <SocraticTutorModal
        isOpen={showTutor}
        onClose={() => setShowTutor(false)}
        chapterId={chapter.id}
        sectionIndex={page}
        sectionTitle={`${chapter.chapterNumber}.${page + 1} ${section.title}`}
        focusMetrics={tracker.metrics}
      />
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        isRelaxMode={relaxMode}
        chapterId={chapter.id}
        questions={chapter.quizQuestions}
      />
      <WaveGameModal isOpen={showGame} onClose={() => setShowGame(false)} />

      {/* Floating Quick-Access AI Socratic Tutor Pill */}
      <button
        type="button"
        onClick={() => setShowTutor(true)}
        aria-label="Open AI Socratic Tutor"
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary px-4 py-2.5 font-bold text-secondary-foreground shadow-2xl backdrop-blur transition-all hover:scale-105 hover:bg-secondary/90"
      >
        <Brain className="h-5 w-5 animate-pulse text-secondary-foreground" />
        <span className="text-sm">AI Socratic Tutor</span>
        <span className="rounded-full bg-secondary-foreground/20 px-2 py-0.5 text-xs font-semibold">
          {tracker.metrics && tracker.metrics.focus > 0 ? `${tracker.metrics.focus}% Focus` : "Active"}
        </span>
      </button>
    </div>
  );
}
