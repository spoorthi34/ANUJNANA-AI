import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TopicBannerProps {
  title: string;
  subtitle: string;
}

export default function TopicBanner({ title, subtitle }: TopicBannerProps) {
  const navigate = useNavigate();
  return (
    <div className="w-full border-b border-border bg-primary/10 py-3 px-6 flex items-center gap-4">
      <Button
        size="sm"
        variant="outline"
        className="rounded-full bg-primary text-primary-foreground border-none hover:bg-primary/90"
        onClick={() => navigate("/dashboard")}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <div className="flex-1 text-center">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
