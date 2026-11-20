import { Bell, Clock, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const notifications = [
  { id: 1, icon: Clock, title: "Revision Reminder", desc: "Review 'Neural Networks' — you may forget in 2 days", time: "5m ago", unread: true },
  { id: 2, icon: BookOpen, title: "New Lesson Available", desc: "Advanced Python: Decorators & Generators", time: "1h ago", unread: true },
  { id: 3, icon: Trophy, title: "Achievement Unlocked!", desc: "You've completed a 7-day learning streak!", time: "3h ago", unread: false },
];

export function NotificationDropdown() {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 border-b border-border last:border-0 flex gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${n.unread ? "bg-primary/5" : ""}`}
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <n.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.desc}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
