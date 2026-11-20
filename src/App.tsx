import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import Topics from "./pages/Topics";
import Practice from "./pages/Practice";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Progress from "./pages/Progress";
import Game from "./pages/Game";
import Revision from "./pages/Revision";
import Concepts from "./pages/Concepts";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";
import OAuthConsent from "./pages/OAuthConsent";
import { DashboardLayout } from "./components/DashboardLayout";
import { AuthProvider } from "./lib/auth";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Nunito:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, []);
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth/consent" element={<OAuthConsent />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:chapterId" element={<Learn />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/game" element={<Game />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/concepts" element={<Concepts />} />
            <Route path="/notes" element={<Notes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
