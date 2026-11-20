import { MessageSquare } from "lucide-react";

interface ProfessorTipProps {
  message: string;
}

export default function ProfessorTip({ message }: ProfessorTipProps) {
  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-[260px] animate-fade-in">
      <div className="bg-[hsl(38,80%,92%)] border-2 border-[hsl(38,70%,75%)] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm text-primary">Professor says:</span>
        </div>
        <p className="text-xs text-foreground/80 ml-10">"{message}"</p>
      </div>
    </div>
  );
}
