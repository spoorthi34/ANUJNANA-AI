import { useEffect, useState } from "react";
import { Box, Waves } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { VideoSpec } from "@/lib/lessonMedia";
import RopeAnimation from "./RopeAnimation";
import WellAnimation from "./WellAnimation";

interface VideoModalProps { isOpen: boolean; onClose: () => void; subtopic: string; videos: [VideoSpec, VideoSpec]; }

export default function VideoModal({ isOpen, onClose, subtopic, videos }: VideoModalProps) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (isOpen) setActive(0); }, [isOpen, videos]);
  const video = videos[active];
  return <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-4 pt-10">
      <DialogTitle className="text-base">Videos for {subtopic}</DialogTitle>
      <DialogDescription className="sr-only">Choose between two lesson animations for this subtopic.</DialogDescription>
      <div className="video-picker" role="tablist" aria-label="Lesson videos">
        {videos.map((item, index) => {
          const Icon = item.scene === "rope" ? Waves : Box;
          return (
            <button key={item.title} type="button" role="tab" aria-selected={active === index}
              className={`video-choice ${active === index ? "video-choice-active" : ""}`}
              onClick={() => setActive(index)}>
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-left">
                <strong className="block text-sm">{item.title}</strong>
                <span className="block text-xs opacity-75">{item.subtitle} · 0:36</span>
              </span>
            </button>
          );
        })}
      </div>
      {isOpen && (video.scene === "rope" ? <RopeAnimation key={video.title} spec={video} /> : <WellAnimation key={video.title} spec={video} />)}
    </DialogContent>
  </Dialog>;
}
