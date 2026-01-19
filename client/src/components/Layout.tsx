import { Link, useLocation } from "wouter";
import { Users, PlusCircle, BarChart3, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/members", icon: Users, label: "成员" },
    { href: "/", icon: PlusCircle, label: "记分" }, // Default to Entry as it's the main action
    { href: "/stats", icon: BarChart3, label: "统计" },
    { href: "/history", icon: History, label: "记录" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto shadow-2xl overflow-hidden border-x border-border">
      {/* Header */}
      <header className="bg-primary px-6 py-4 text-primary-foreground shadow-md z-10">
        <h1 className="text-xl font-heading font-bold">聚餐积分助手</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-border px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <ul className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "text-primary font-medium bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}>
                    <item.icon className={cn("h-6 w-6 mb-1", isActive && "stroke-[2.5px]")} />
                    <span className="text-xs">{item.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
