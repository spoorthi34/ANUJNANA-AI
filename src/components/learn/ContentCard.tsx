import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentCardProps {
  title: string;
  content: string;
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ContentCard({ title, content, currentPage, totalPages, onPrevious, onNext }: ContentCardProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="lesson-content-card flex-1 bg-card rounded-2xl border-2 border-border shadow-md p-6 md:p-9 overflow-y-auto min-h-[360px]">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          <div className="lesson-content-dots flex gap-1.5 shrink-0 ml-4" aria-hidden="true">
            <div className="h-5 w-5 rounded-full" />
            <div className="h-5 w-5 rounded-full" />
            <div className="h-5 w-5 rounded-full" />
          </div>
        </div>
        <div className="text-base text-foreground/80 leading-8 whitespace-pre-line">
          {content}
        </div>
        <div className="mt-6 flex justify-end text-xs text-muted-foreground">
          📄 {currentPage}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <div className="flex gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === currentPage - 1 ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="text-muted-foreground"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
