import { useState } from "react";
import { Link } from "react-router-dom";
import { Atom, BookOpen, Box, Brain, ChevronRight, GraduationCap, Menu, Sparkles, Star, Waves, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SocraticTutorModal from "@/components/learn/SocraticTutorModal";

const topics = [
  { id: "infinite-potential-well", title: "Infinite Potential Well", tagline: "Particles trapped in perfect quantum boxes", icon: Box, tone: "course-infinite" },
  { id: "finite-potential-well", title: "Finite Potential Well", tagline: "When walls allow quantum leakage", icon: Waves, tone: "course-finite" },
  { id: "quantum-tunneling", title: "Quantum Tunneling", tagline: "The magic of walking through walls", icon: Zap, tone: "course-tunneling" },
];

function CourseNavigation() {
  return <>
    <Link to="/" className="course-brand">
      <span className="course-brand-icon"><Atom className="h-7 w-7" /></span>
      <span><strong className="font-display text-xl leading-none">Quantum</strong><span className="block text-xs text-muted-foreground">Physics Lab</span></span>
    </Link>
    <nav className="mt-9" aria-label="Course contents">
      <p className="mb-3 text-[10px] font-bold uppercase text-muted-foreground">Course contents</p>
      <div className="space-y-3">{topics.map(topic => <Button asChild variant="ghost" key={topic.id} className="course-nav-item w-full justify-between whitespace-normal text-left"><Link to={`/learn/${topic.id}`}><span>{topic.title}</span><ChevronRight className="h-4 w-4 shrink-0" /></Link></Button>)}</div>
    </nav>
    <Link to="/dashboard" className="course-welcome mt-auto flex items-center gap-3 rounded-2xl p-4 shadow-sm"><span className="course-welcome-icon flex h-9 w-9 items-center justify-center rounded-xl"><GraduationCap className="h-5 w-5" /></span><span className="text-xs"><strong className="block">Your learning journey</strong><span className="text-muted-foreground">3 chapters to explore</span></span></Link>
  </>;
}

export default function Topics() {
  const [showTutor, setShowTutor] = useState(false);

  return <div className="course-page min-h-screen">
    <aside className="course-sidebar hidden md:flex"><CourseNavigation /></aside>
    <div className="flex items-center justify-between p-5 md:hidden">
      <Link to="/" className="course-brand"><span className="course-brand-icon"><Atom className="h-6 w-6" /></span><span className="font-display font-bold">Quantum Physics Lab</span></Link>
      <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open course contents"><Menu className="h-5 w-5" /></Button></SheetTrigger><SheetContent side="left" className="flex flex-col pt-12"><CourseNavigation /></SheetContent></Sheet>
    </div>
    <main className="course-main relative min-w-0 overflow-hidden">
      <svg className="course-orbits pointer-events-none absolute" viewBox="0 0 650 550" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.2"><ellipse cx="460" cy="420" rx="340" ry="120" transform="rotate(-58 460 420)"/><ellipse cx="460" cy="420" rx="340" ry="150" transform="rotate(-43 460 420)"/><ellipse cx="460" cy="420" rx="340" ry="190" transform="rotate(-30 460 420)"/></g><circle cx="171" cy="394" r="10" fill="currentColor" /></svg>
      <div className="course-content relative mx-auto">
        <header className="text-center">
          <p className="mb-5 flex items-center justify-center gap-2 text-xs"><Sparkles className="h-4 w-4 text-accent" /> Welcome to Quantum Mechanics</p>
          <h1 className="course-heading font-display font-bold">Explore the Quantum World</h1>
          <p className="course-subtitle mx-auto mt-3 max-w-2xl text-muted-foreground">Dive into the fascinating realm of quantum mechanics through interactive lessons and visualizations</p>
        </header>
        <div className="course-grid grid grid-cols-1 gap-6 sm:grid-cols-3">
          {topics.map(topic => <Link to={`/learn/${topic.id}`} key={topic.id} className={`course-tile ${topic.tone} relative flex flex-col overflow-hidden rounded-[22px] p-6 transition-transform hover:-translate-y-1`}>
            <span className="course-corner" aria-hidden="true" />
            <span className="course-tile-icon relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"><topic.icon className="h-7 w-7" /></span>
            <h2 className="relative mb-3 font-display text-[23px] font-bold leading-snug">{topic.title}</h2>
            <p className="relative text-sm leading-snug text-muted-foreground">{topic.tagline}</p>
            <span className="relative mt-auto flex items-center gap-2 pt-5 font-display text-sm">Start Learning <ChevronRight className="h-4 w-4" /></span>
          </Link>)}
        </div>

        {/* AI Socratic Feature Showcase Banner */}
        <div className="mt-8 rounded-2xl border border-secondary/30 bg-secondary/10 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-secondary mb-2">
                <Brain className="h-4 w-4" />
                <span>v2.0 Multi-Agent Cognitive Scaffolding</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">AI Socratic Physics Tutor</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                Powered by real-time cognitive misconception profiling, biometric attention adaptation, and DeepSeek-R1 style reasoning. Never gives away answers — guides you to discover them.
              </p>
            </div>
            <Button
              onClick={() => setShowTutor(true)}
              className="shrink-0 gap-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-5 py-2.5 shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask AI Socratic Tutor</span>
            </Button>
          </div>

          {/* 3 Live Feature Highlights */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-secondary/20 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">1</span>
              <span><strong>Multi-Agent Scaffolding:</strong> Diagnoses misconceptions</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">2</span>
              <span><strong>Biometric Feedback:</strong> Focus & cognitive load adaptive</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">3</span>
              <span><strong>Thinking Process:</strong> DeepSeek-R1 style CoT steps</span>
            </div>
          </div>
        </div>

        <div className="course-stats mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4">
          {[{ icon: BookOpen, value: "3", label: "Chapters" }, { icon: Star, value: "12", label: "Subtopics" }, { icon: Sparkles, value: "100%", label: "Interactive" }].map(stat => <div key={stat.label} className="flex items-start justify-center gap-2"><stat.icon className="mt-1 h-5 w-5 text-muted-foreground" /><div><strong className="font-display text-xl">{stat.value}</strong><p className="text-[11px] text-muted-foreground">{stat.label}</p></div></div>)}
        </div>
      </div>
    </main>

    {/* Floating Quick-Access AI Socratic Tutor Pill */}
    <button
      type="button"
      onClick={() => setShowTutor(true)}
      aria-label="Open AI Socratic Tutor"
      className="fixed bottom-8 right-6 z-40 flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary px-4 py-2.5 font-bold text-secondary-foreground shadow-2xl backdrop-blur transition-all hover:scale-105 hover:bg-secondary/90"
    >
      <Brain className="h-5 w-5 animate-pulse text-secondary-foreground" />
      <span className="text-sm">AI Socratic Tutor</span>
    </button>

    <SocraticTutorModal
      isOpen={showTutor}
      onClose={() => setShowTutor(false)}
    />
  </div>;
}
