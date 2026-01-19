import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy } from "lucide-react";

export default function Stats() {
  const { members, events } = useStore();

  // Calculate points per member
  const memberPoints = members.map(member => {
    const totalPoints = events.reduce((sum, event) => {
      if (event.attendees.includes(member.id)) {
        return sum + event.points;
      }
      return sum;
    }, 0);
    const eventCount = events.filter(e => e.attendees.includes(member.id)).length;
    return {
      id: member.id,
      name: member.name,
      points: totalPoints,
      events: eventCount
    };
  }).sort((a, b) => b.points - a.points); // Sort descending

  const topMembers = memberPoints.slice(0, 10); // For chart

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-heading">积分统计</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">积分排行榜 (Top 10)</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMembers} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={60} 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
                {topMembers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg px-2">全员明细</h3>
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
                {index < 3 && <Trophy className={`w-4 h-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} />}
                <span className="text-xl font-bold font-heading text-primary">{member.points}</span>
                <span className="text-xs text-muted-foreground pt-1">分</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
