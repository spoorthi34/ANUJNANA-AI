interface SubtopicSidebarProps {
  topicTitle: string;
  subtopics: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function SubtopicSidebar({ topicTitle, subtopics, activeIndex, onSelect }: SubtopicSidebarProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-foreground mb-3">{topicTitle}</h3>
      <div className="space-y-1">
        {subtopics.map((sub, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              i === activeIndex
                ? "bg-primary/15 text-primary font-medium border border-primary/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>
    </div>
  );
}
