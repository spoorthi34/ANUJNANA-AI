import { Volume2, Video, Brain, Gamepad2, CheckCircle2, BookOpen, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomActionBarProps {
  isRelaxMode?: boolean;
  onAudioSummary?: () => void;
  onWatchVideo?: () => void;
  onTakeQuiz?: () => void;
  onAskDoubt?: () => void;
  onPlayGame?: () => void;
  onCompleted?: () => void;
  onToggleRelax?: () => void;
  completed?: boolean;
}

export default function BottomActionBar({
  isRelaxMode,
  onAudioSummary,
  onWatchVideo,
  onTakeQuiz,
  onAskDoubt,
  onPlayGame,
  onCompleted,
  onToggleRelax,
  completed = false,
}: BottomActionBarProps) {
  const actions = isRelaxMode
    ? [
        { icon: Volume2, label: "Listen to Story", onClick: onAudioSummary },
        { icon: Video, label: "Watch Animation", onClick: onWatchVideo },
        { icon: BookOpen, label: "Fun Quiz", onClick: onTakeQuiz },
        { icon: Brain, label: "AI Socratic Tutor", onClick: onAskDoubt },
        { icon: Gamepad2, label: "Play Game", onClick: onPlayGame },
      ]
    : [
        { icon: Volume2, label: "Audio Summary", onClick: onAudioSummary },
        { icon: Video, label: "Watch Video", onClick: onWatchVideo },
        { icon: BookOpen, label: "Take Quiz", onClick: onTakeQuiz },
        { icon: Brain, label: "AI Socratic Tutor", onClick: onAskDoubt },
        { icon: Gamepad2, label: "Play Game", onClick: onPlayGame },
      ];

  return (
    <div className={`lesson-actions ${isRelaxMode ? "lesson-actions-relaxed" : ""}`}>
      <div className="lesson-actions-inner">
        {actions.map((action, i) => (
          <Button
            key={i}
            variant="ghost"
            onClick={action.onClick}
            className={`lesson-action lesson-action-${i}`}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-center leading-tight">
              {action.label}
            </span>
          </Button>
        ))}

        {isRelaxMode ? (
          <Button
            onClick={onToggleRelax}
            variant="outline"
            size="sm"
            className="lesson-action lesson-return"
          >
            <Undo2 className="h-4 w-4 mr-1.5" />
            Back to Normal
          </Button>
        ) : null}

        <Button
          onClick={onCompleted}
          className="lesson-action lesson-complete"
          size="sm"
        >
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          {completed ? "Completed!" : "Mark Complete"}
        </Button>
      </div>
    </div>
  );
}
