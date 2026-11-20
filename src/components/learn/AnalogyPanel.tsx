import { PenTool } from "lucide-react";

interface AnalogyPanelProps {
  title: string;
  analogy: string;
}

export default function AnalogyPanel({ title, analogy }: AnalogyPanelProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <PenTool className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>
      <div className="border-l-2 border-primary/30 pl-4">
        <p className="text-sm leading-relaxed text-foreground/80">
          <span className="font-semibold not-italic text-primary">Analogy: </span>
          {analogy}
        </p>
      </div>
    </div>
  );
}
