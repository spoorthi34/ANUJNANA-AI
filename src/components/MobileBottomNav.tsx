import { NavLink } from "@/components/NavLink";
import { navItems } from "@/components/AppSidebar";

export function MobileBottomNav() {
  // Keep the bottom nav compact: show the most important 5 destinations
  const items = navItems.filter((i) =>
    ["Dashboard", "Chapters", "Learn", "Revision", "Profile"].includes(i.title)
  );

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-panel rounded-t-3xl px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      <ul className="flex items-center justify-between">
        {items.map((item) => (
          <li key={item.title} className="flex-1">
            <NavLink
              to={item.url}
              end
              className="flex flex-col items-center gap-1 py-1.5 text-[10px] font-medium text-muted-foreground rounded-xl transition-colors"
              activeClassName="text-primary"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
