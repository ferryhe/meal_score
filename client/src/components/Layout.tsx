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
    <div className="flex flex-col h-screen bg-[#f8fafc] max-w-md mx-auto shadow-sm overflow-hidden border-x border-slate-200">
      {/* Header */}
      <header className="bg-white px-6 py-5 border-b border-slate-100 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight text-center">
          牛肉面群积分助手
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-2 pb-safe z-30 shadow-lg">
        <ul className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
                    isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                  )}>
                    <item.icon className={cn("h-6 w-6 mb-1", isActive && "stroke-[2.5px]")} />
                    <span className="text-[11px] font-medium">{item.label}</span>
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
