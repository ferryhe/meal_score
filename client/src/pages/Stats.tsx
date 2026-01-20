import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Trophy, Calendar, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Stats() {
  const { members, events } = useStore();
  
  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    events.forEach(event => {
      const year = new Date(event.date).getFullYear().toString();
      yearsSet.add(year);
    });
    if (yearsSet.size === 0) {
      yearsSet.add(new Date().getFullYear().toString());
    }
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [events]);

  const [selectedYear, setSelectedYear] = useState<string>(years[0]);

  useEffect(() => {
    if (!years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => new Date(event.date).getFullYear().toString() === selectedYear);
  }, [events, selectedYear]);

  const memberPoints = useMemo(() => {
    return members.map(member => {
      const totalPoints = filteredEvents.reduce((sum, event) => {
        if (event.attendees.includes(member.id)) {
          return sum + event.points;
        }
        return sum;
      }, 0);
      const eventCount = filteredEvents.filter(e => e.attendees.includes(member.id)).length;
      return {
        id: member.id,
        name: member.name,
        points: totalPoints,
        events: eventCount
      };
    }).sort((a, b) => b.points - a.points);
  }, [members, filteredEvents]);

  const topMembers = memberPoints.slice(0, 5);
  const chartColors = [
    "hsl(221 83% 53%)",
    "hsl(221 83% 63%)",
    "hsl(221 83% 73%)",
    "hsl(221 83% 83%)",
    "hsl(221 83% 93%)",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-3xl font-black font-heading tracking-tighter uppercase italic">
          数据 <span className="text-primary/40 not-italic">STATS</span>
        </h2>
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-2xl shadow-sm border-none">
          <Calendar className="h-3 w-3 text-primary" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[80px] h-6 border-none bg-transparent font-black text-[10px] p-0 focus:ring-0 uppercase tracking-widest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-none rounded-2xl">
              {years.map(year => (
                <SelectItem key={year} value={year} className="text-[10px] font-black uppercase">{year} YEAR</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-soft rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary fill-primary" />
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {selectedYear} TOP LEADERS
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-[240px] w-full p-6 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMembers} layout="vertical" margin={{ left: 10, right: 35, top: 10, bottom: 10 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={70} 
                tick={{ fontSize: 11, fontWeight: 900, fill: "hsl(var(--foreground))" }} 
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="points" radius={[0, 10, 10, 0]} barSize={24}>
                {topMembers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
                <LabelList dataKey="points" position="right" fill="hsl(var(--primary))" fontSize={14} fontWeight={900} offset={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-xl font-heading tracking-tight uppercase">
            全员明细 <span className="text-primary/20 text-sm">/ ALL MEMBERS</span>
          </h3>
        </div>
        <div className="grid gap-4">
          {memberPoints.map((member, index) => (
            <div 
              key={member.id} 
              className="group relative flex items-center justify-between p-5 bg-white rounded-3xl border-none shadow-sm hover:shadow-soft transition-all duration-300 overflow-hidden"
            >
              {index < 3 && (
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-20 transition-opacity">
                   <Trophy className="w-16 h-16 -rotate-12" />
                </div>
              )}
              <div className="flex items-center gap-5 relative z-10">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg shadow-inner",
                  index === 0 ? "bg-primary text-white" : "bg-secondary text-secondary-foreground"
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-black text-lg tracking-tight uppercase">{member.name}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    {member.events} DINNERS COMPLETED
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end relative z-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-heading text-primary">{member.points}</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">PTS</span>
                </div>
                {index < 3 && member.points > 0 && (
                   <div className={cn(
                     "text-[9px] font-black px-2 py-0.5 rounded-full mt-1 uppercase tracking-tighter",
                     index === 0 ? "bg-yellow-400/20 text-yellow-600" : 
                     index === 1 ? "bg-slate-400/20 text-slate-600" : 
                     "bg-orange-400/20 text-orange-600"
                   )}>
                     Top {index + 1}
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
