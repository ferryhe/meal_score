import { Link, useLocation } from "wouter";
import { Users, PlusCircle, BarChart3, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: PlusCircle, label: "记分" },
    { href: "/stats", icon: BarChart3, label: "统计" },
    { href: "/history", icon: History, label: "记录" },
    { href: "/members", icon: Users, label: "成员" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden border-x border-border relative noise">
      {/* Header */}
      <header className="bg-primary px-6 py-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-2xl font-heading font-black tracking-tighter uppercase italic">
            牛肉面群 <span className="text-white/80 not-italic font-medium">积分助手</span>
          </h1>
          <p className="text-[10px] text-white/60 font-medium tracking-widest mt-0.5 uppercase">Beef Noodle Community Hub</p>
        </div>
        {/* Abstract decor */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-5 pb-32">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-border/50 px-6 py-3 shadow-soft z-30 rounded-t-3xl">
        <ul className="flex justify-between items-center px-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex flex-col items-center justify-center transition-all duration-300 relative group",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <div className={cn(
                      "p-2 rounded-xl transition-all duration-300",
                      isActive ? "bg-primary/10 shadow-inner" : "group-hover:bg-muted/50"
                    )}>
                      <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px] animate-pulse-slow")} />
                    </div>
                    <span className={cn(
                      "text-[10px] mt-1 font-bold tracking-tight uppercase transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-60"
                    )}>{item.label}</span>
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
