import { LayoutDashboard, BookOpen, Trophy, User, Brain, LineChart, GraduationCap, BellRing, Network, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Chapters", url: "/topics", icon: BookOpen },
  { title: "Learn", url: "/learn", icon: GraduationCap },
  { title: "Practice", url: "/practice", icon: Brain },
  { title: "Progress", url: "/progress", icon: LineChart },
  { title: "Revision", url: "/revision", icon: BellRing },
  { title: "Concept Map", url: "/concepts", icon: Network },
  { title: "My Notes", url: "/notes", icon: FileText },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border hidden md:flex">
      <SidebarContent className="pt-6">
        <div className="px-4 mb-6 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
              <ellipse cx="12" cy="12" rx="10" ry="4.2" />
              <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-base text-foreground leading-none">AnuJnana</span>
              <p className="text-[9px] text-muted-foreground leading-none">Quantum learning</p>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50 rounded-lg px-3 py-2.5"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
