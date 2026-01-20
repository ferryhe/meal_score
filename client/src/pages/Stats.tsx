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
} from "recharts";
import { Trophy, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">积分统计</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[80px] h-6 border-none bg-transparent font-medium text-xs p-0 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-100 rounded-xl">
              {years.map(year => (
                <SelectItem key={year} value={year} className="text-xs">{year}年</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {selectedYear}年 积分前五名
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] w-full p-6 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMembers} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={70} 
                tick={{ fontSize: 13, fontWeight: 500, fill: "hsl(var(--foreground))" }} 
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="points" radius={[0, 6, 6, 0]} barSize={20} fill="#2563eb">
                {topMembers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 px-1">全员明细</h3>
        <div className="grid gap-3">
          {memberPoints.map((member, index) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm",
                  index === 0 ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600"
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{member.name}</div>
                  <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                    聚餐 {member.events} 次
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-blue-600">{member.points}</span>
                  <span className="text-[10px] font-medium text-slate-400">分</span>
                </div>
                {index < 3 && member.points > 0 && (
                   <div className={cn(
                     "text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1",
                     index === 0 ? "bg-yellow-50 text-yellow-600" : 
                     index === 1 ? "bg-slate-50 text-slate-500" : 
                     "bg-orange-50 text-orange-600"
                   )}>
                     第{index + 1}名
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
