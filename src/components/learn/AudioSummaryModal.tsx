import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Pause, Play, Square, Headphones, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** One narration line per subtopic. */
  transcript: string[];
  /** Subtopic to start reading from. */
  startLine?: number;
  /** Called the first time playback starts after the dialog opens. */
  onStart?: () => void;
}

const SPEEDS = [1, 0.8, 1.2];
const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;
const sentences = (line: string) => line.match(/[^.!?]+[.!?]*/g)?.map((part) => part.trim()).filter(Boolean) ?? [line];

export default function AudioSummaryModal({ isOpen, onClose, title, transcript, startLine = 0, onStart }: AudioSummaryModalProps) {
  const started = useRef(false);
  useEffect(() => { if (isOpen) started.current = false; }, [isOpen]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [finished, setFinished] = useState(false);
  const run = useRef(0);
  const speechAvailable = hasSpeech();

  const stopSpeech = useCallback(() => {
    run.current += 1;
    if (hasSpeech()) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (!isOpen) { stopSpeech(); return; }
    setActiveLine(Math.min(startLine, transcript.length - 1));
    setFinished(false);
    setIsPlaying(true);
    return stopSpeech;
  }, [isOpen, startLine, transcript, stopSpeech]);

  const advance = useCallback(() => {
    setActiveLine((line) => {
      if (line + 1 < transcript.length) return line + 1;
      setIsPlaying(false);
      setFinished(true);
      return line;
    });
  }, [transcript.length]);

  // Read the active line aloud, then move to the next one.
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const line = transcript[activeLine];
    if (!line) return;
    const id = ++run.current;
    if (!speechAvailable) {
      const timer = window.setTimeout(advance, Math.max(2500, line.length * 55) / speed);
      return () => window.clearTimeout(timer);
    }
    window.speechSynthesis.cancel();
    const parts = sentences(line);
    parts.forEach((part, index) => {
      const utterance = new SpeechSynthesisUtterance(part);
      utterance.rate = speed;
      utterance.lang = "en-US";
      if (index === parts.length - 1) utterance.onend = () => { if (run.current === id) { run.current += 1; advance(); } };
      window.speechSynthesis.speak(utterance);
    });
    // Safety net: some devices have no voice installed and never report the end of speech.
    const fallback = window.setTimeout(() => { if (run.current === id) advance(); }, (line.length * 90 + 4000) / speed);
    return () => { window.clearTimeout(fallback); if (run.current === id) { run.current += 1; window.speechSynthesis.cancel(); } };
  }, [isOpen, isPlaying, activeLine, speed, transcript, speechAvailable, advance]);

  if (!isOpen) return null;

  const progress = ((activeLine + (finished ? 1 : 0.5)) / transcript.length) * 100;
  const play = () => {
    if (!started.current) { started.current = true; onStart?.(); }
    if (finished) { setActiveLine(0); setFinished(false); }
    setIsPlaying(true);
  };
  const stop = () => { stopSpeech(); setIsPlaying(false); setActiveLine(0); setFinished(false); };
  const close = () => { stopSpeech(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="glass-panel rounded-3xl border border-border shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="text-lg font-semibold text-foreground">🎧 {title}</span>
          <Button variant="ghost" size="icon" onClick={close} aria-label="Close audio" className="text-muted-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {!speechAvailable && (
          <div className="mx-6 mt-4 bg-accent/10 border border-accent/30 rounded-xl px-4 py-2.5 text-sm text-accent-foreground flex items-center gap-2">
            <VolumeX className="h-4 w-4 shrink-0" /> This browser can't read aloud, so the story plays as text only.
          </div>
        )}

        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Button size="lg" className="rounded-full h-16 w-16 gradient-primary text-primary-foreground"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={() => (isPlaying ? (stopSpeech(), setIsPlaying(false)) : play())}>
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" onClick={stop}>
              <Square className="h-4 w-4 mr-1.5" /> Stop
            </Button>
            <Button variant="outline" size="sm" className="rounded-full tabular-nums" aria-label="Change reading speed"
              onClick={() => setSpeed((value) => SPEEDS[(SPEEDS.indexOf(value) + 1) % SPEEDS.length])}>
              {speed}×
            </Button>
          </div>

          <div className="w-full flex items-end justify-center gap-1 h-12" aria-hidden="true">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.span key={i}
                className={`w-1 rounded-full ${i / 40 < progress / 100 ? "bg-primary" : "bg-muted"}`}
                animate={isPlaying ? { height: [6, 22, 10, 28, 6] } : { height: 6 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.03 }} />
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {isPlaying ? `🔊 Reading part ${activeLine + 1} of ${transcript.length}…` : finished ? "✅ Finished — press play to hear it again" : "⏸ Paused"}
          </p>
        </div>

        <div className="px-6 pb-4 flex-1 overflow-y-auto">
          <div className="bg-muted/40 rounded-2xl p-5 border border-border">
            <p className="text-sm font-semibold text-foreground mb-3">📝 Live Transcript <span className="font-normal text-muted-foreground">· tap a line to jump</span></p>
            <div className="space-y-2.5 text-sm leading-relaxed">
              {transcript.map((line, i) => (
                <button key={i} type="button"
                  onClick={() => { setFinished(false); setActiveLine(i); setIsPlaying(true); }}
                  className={`block w-full text-left rounded-lg px-2 py-1 transition-colors ${i === activeLine ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted"}`}>
                  <span className="mr-1.5 text-xs font-bold opacity-60">{i + 1}.</span>{line}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5" /> Read aloud by your device's voice.
          </p>
          <Button variant="outline" className="rounded-full" onClick={close}>Close</Button>
        </div>
      </div>
    </div>
  );
}
