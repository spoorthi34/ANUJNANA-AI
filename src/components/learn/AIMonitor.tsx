import { useEffect, useRef } from "react";
import { Brain, Camera, CameraOff, Eye, EyeOff, Loader2, ScanFace, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AttentionStatus, FocusTracker } from "@/hooks/useFocusTracker";

interface AIMonitorProps {
  tracker: FocusTracker;
}

const statusLabel: Record<AttentionStatus, string> = {
  focused: "Looking at the lesson",
  "looking-away": "Looking away",
  "eyes-closed": "Eyes closed",
  "no-face": "No face in view",
};

export default function AIMonitor({ tracker }: AIMonitorProps) {
  const { camState, analysis, stream, metrics, toggle } = tracker;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream, camState]);

  const live = camState === "on" && analysis === "running" && metrics;
  const focus = live ? metrics.focus : null;
  const effort = live ? metrics.effort : null;
  const badge = live ? "LIVE" : camState === "on" && analysis === "loading" ? "STARTING" : "OFF";

  return (
    <div className="lesson-monitor-stack">
      <section className="lesson-monitor-panel" aria-live="polite">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI Monitor</span>
          </div>
          <span className={`lesson-monitor-badge ${live ? "is-live" : ""}`}>{badge}</span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Effort</span>
              <span className="font-medium text-foreground">{effort === null ? "—" : `${effort}%`}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="lesson-load-fill h-2 rounded-full transition-all" style={{ width: `${effort ?? 0}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Focus</span>
              <span className="font-medium text-foreground">{focus === null ? "—" : `${focus}%`}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="lesson-focus-bar h-2 rounded-full transition-all" style={{ width: `${focus ?? 0}%` }} />
            </div>
          </div>
          {live && (
            <div className="flex items-center justify-between text-xs">
              <span className={`lesson-attention lesson-attention-${metrics.status}`}>
                {metrics.status === "focused" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {statusLabel[metrics.status]}
              </span>
              <span className="text-muted-foreground">{metrics.blinksPerMinute} blinks/min</span>
            </div>
          )}
        </div>
      </section>

      <section className="lesson-camera-panel">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-foreground">
          <ScanFace className="h-4 w-4 text-primary" />
          <span>Tracking</span>
        </div>
        <div className="lesson-camera-screen relative flex aspect-video flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-border">
          {camState === "on" ? (
            <>
              <video ref={videoRef} autoPlay muted playsInline className="lesson-camera-video h-full w-full object-cover" />
              {analysis === "loading" && (
                <span className="lesson-camera-chip"><Loader2 className="h-3 w-3 animate-spin" />Loading face analysis…</span>
              )}
            </>
          ) : camState === "starting" ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
              <span className="text-xs text-muted-foreground">Waiting for camera permission…</span>
            </>
          ) : camState === "error" ? (
            <>
              <CameraOff className="h-6 w-6 text-primary/60" />
              <span className="px-3 text-center text-xs text-muted-foreground">
                Camera is blocked or unavailable. Allow camera access in your browser and try again.
              </span>
            </>
          ) : (
            <>
              <Camera className="h-6 w-6 text-primary/60" />
              <span className="text-xs text-muted-foreground">Camera is off</span>
            </>
          )}
        </div>
        <Button
          onClick={toggle}
          variant={camState === "on" ? "secondary" : "outline"}
          size="sm"
          className="mt-3 w-full"
          disabled={camState === "starting"}
          aria-pressed={camState === "on"}
        >
          {camState === "on" ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {camState === "on" ? "Turn camera off" : "Turn camera on"}
        </Button>
        {analysis === "unavailable" && (
          <span className="mt-2 block text-xs text-muted-foreground">Face analysis couldn't load. The preview still works.</span>
        )}
      </section>

      <p className="lesson-monitor-note">
        <ShieldCheck className="h-4 w-4 shrink-0 text-secondary" />
        Your face is analysed on this device only. Nothing is recorded or uploaded.
      </p>
    </div>
  );
}
