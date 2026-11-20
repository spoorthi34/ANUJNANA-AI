import { Link } from "react-router-dom";
import { Atom, BookOpen, Box, ChevronRight, GraduationCap, Menu, Sparkles, Star, Waves, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const topics = [
  { id: "infinite-potential-well", title: "Infinite Potential Well", tagline: "Particles trapped in perfect quantum boxes", icon: Box, tone: "course-infinite" },
  { id: "finite-potential-well", title: "Finite Potential Well", tagline: "When walls allow quantum leakage", icon: Waves, tone: "course-finite" },
  { id: "quantum-tunneling", title: "Quantum Tunneling", tagline: "The magic of walking through walls", icon: Zap, tone: "course-tunneling" },
];

function CourseNavigation() {
  return <>
    <Link to="/" className="course-brand">
      <span className="course-brand-icon"><Atom className="h-7 w-7" /></span>
      <span><strong className="font-display text-xl leading-none">Quantum</strong><span className="block text-xs text-muted-foreground">Physics Lab</span></span>
    </Link>
    <nav className="mt-9" aria-label="Course contents">
      <p className="mb-3 text-[10px] font-bold uppercase text-muted-foreground">Course contents</p>
      <div className="space-y-3">{topics.map(topic => <Button asChild variant="ghost" key={topic.id} className="course-nav-item w-full justify-between whitespace-normal text-left"><Link to={`/learn/${topic.id}`}><span>{topic.title}</span><ChevronRight className="h-4 w-4 shrink-0" /></Link></Button>)}</div>
    </nav>
    <Link to="/dashboard" className="course-welcome mt-auto flex items-center gap-3 rounded-2xl p-4 shadow-sm"><span className="course-welcome-icon flex h-9 w-9 items-center justify-center rounded-xl"><GraduationCap className="h-5 w-5" /></span><span className="text-xs"><strong className="block">Your learning journey</strong><span className="text-muted-foreground">3 chapters to explore</span></span></Link>
  </>;
}

export default function Topics() {
  return <div className="course-page min-h-screen">
    <aside className="course-sidebar hidden md:flex"><CourseNavigation /></aside>
    <div className="flex items-center justify-between p-5 md:hidden">
      <Link to="/" className="course-brand"><span className="course-brand-icon"><Atom className="h-6 w-6" /></span><span className="font-display font-bold">Quantum Physics Lab</span></Link>
      <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open course contents"><Menu className="h-5 w-5" /></Button></SheetTrigger><SheetContent side="left" className="flex flex-col pt-12"><CourseNavigation /></SheetContent></Sheet>
    </div>
    <main className="course-main relative min-w-0 overflow-hidden">
      <svg className="course-orbits pointer-events-none absolute" viewBox="0 0 650 550" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.2"><ellipse cx="460" cy="420" rx="340" ry="120" transform="rotate(-58 460 420)"/><ellipse cx="460" cy="420" rx="340" ry="150" transform="rotate(-43 460 420)"/><ellipse cx="460" cy="420" rx="340" ry="190" transform="rotate(-30 460 420)"/></g><circle cx="171" cy="394" r="10" fill="currentColor" /></svg>
      <div className="course-content relative mx-auto">
        <header className="text-center">
          <p className="mb-5 flex items-center justify-center gap-2 text-xs"><Sparkles className="h-4 w-4 text-accent" /> Welcome to Quantum Mechanics</p>
          <h1 className="course-heading font-display font-bold">Explore the Quantum World</h1>
          <p className="course-subtitle mx-auto mt-3 max-w-2xl text-muted-foreground">Dive into the fascinating realm of quantum mechanics through interactive lessons and visualizations</p>
        </header>
        <div className="course-grid grid grid-cols-1 gap-6 sm:grid-cols-3">
          {topics.map(topic => <Link to={`/learn/${topic.id}`} key={topic.id} className={`course-tile ${topic.tone} relative flex flex-col overflow-hidden rounded-[22px] p-6 transition-transform hover:-translate-y-1`}>
            <span className="course-corner" aria-hidden="true" />
            <span className="course-tile-icon relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"><topic.icon className="h-7 w-7" /></span>
            <h2 className="relative mb-3 font-display text-[23px] font-bold leading-snug">{topic.title}</h2>
            <p className="relative text-sm leading-snug text-muted-foreground">{topic.tagline}</p>
            <span className="relative mt-auto flex items-center gap-2 pt-5 font-display text-sm">Start Learning <ChevronRight className="h-4 w-4" /></span>
          </Link>)}
        </div>
        <div className="course-stats mx-auto grid max-w-lg grid-cols-3 gap-4">
          {[{ icon: BookOpen, value: "3", label: "Chapters" }, { icon: Star, value: "12", label: "Subtopics" }, { icon: Sparkles, value: "100%", label: "Interactive" }].map(stat => <div key={stat.label} className="flex items-start justify-center gap-2"><stat.icon className="mt-1 h-5 w-5 text-muted-foreground" /><div><strong className="font-display text-xl">{stat.value}</strong><p className="text-[11px] text-muted-foreground">{stat.label}</p></div></div>)}
        </div>
      </div>
    </main>
  </div>;
}
