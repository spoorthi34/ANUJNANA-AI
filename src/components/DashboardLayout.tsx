import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export function DashboardLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border px-4 bg-background/90 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="ml-1 hidden md:flex" />
            <div className="md:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
                  <ellipse cx="12" cy="12" rx="10" ry="4.2" />
                  <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
                  <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
                </svg>
              </div>
              <span className="font-bold text-sm text-foreground">AnuJnana</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
