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
import { Trophy, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Stats() {
  const { members, events } = useStore();
  
  // Get all available years from events
  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    events.forEach(event => {
      const year = new Date(event.date).getFullYear().toString();
      yearsSet.add(year);
    });
    // Add current year if no events
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

  // Filter events by selected year
  const filteredEvents = useMemo(() => {
    return events.filter(event => new Date(event.date).getFullYear().toString() === selectedYear);
  }, [events, selectedYear]);

  // Calculate points per member for the selected year
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
    "hsl(199 89% 48%)",
    "hsl(160 84% 39%)",
    "hsl(43 96% 56%)",
    "hsl(0 84% 60%)",
    "hsl(217 91% 60%)",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-heading">积分统计</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder="年份" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}年</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {selectedYear}年 积分排行榜 (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMembers} layout="vertical" margin={{ left: 20, right: 28 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80} 
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickMargin={8}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="points" radius={[0, 8, 8, 0]} barSize={18}>
                {topMembers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
                <LabelList dataKey="points" position="right" fill="hsl(var(--foreground))" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg px-2">{selectedYear}年 全员明细</h3>
        <div className="grid gap-3">
          {memberPoints.map((member, index) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-xs text-muted-foreground">参与 {member.events} 次聚餐</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {index < 3 && member.points > 0 && <Trophy className={`w-4 h-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} />}
                <span className="text-xl font-bold font-heading text-primary">{member.points}</span>
                <span className="text-xs text-muted-foreground pt-1">分</span>
              </div>
            </div>
          ))}
          {memberPoints.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              该年份暂无聚餐记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
