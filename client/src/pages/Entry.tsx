import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Entry() {
  const { members, addEvent } = useStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [manualPoints, setManualPoints] = useState<number | null>(null);
  const { toast } = useToast();
  const [, setLocationPath] = useLocation();

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const count = selectedIds.size;
  
  const calculatedPoints = useMemo(() => {
    if (count < 2) return 0;
    if (count <= 5) return 1;
    if (count <= 8) return 3;
    if (count <= 15) return 5;
    return 10;
  }, [count]);

  const finalPoints = manualPoints !== null ? manualPoints : calculatedPoints;

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSubmit = async () => {
    if (count === 0) {
      toast({ title: "请选择参与人员", variant: "destructive" });
      return;
    }

    try {
      await addEvent({
        date,
        location: location || "未填写地点",
        description: description || "聚餐",
        attendees: Array.from(selectedIds),
        points: finalPoints,
      });

      toast({
        title: "记录保存成功",
        description: `本次聚餐 ${count} 人，每人 ${finalPoints} 分`,
      });

      // Reset or Redirect
      setSelectedIds(new Set());
      setLocation("");
      setDescription("");
      setManualPoints(null);
      setLocationPath("/history");
    } catch (error) {
      console.error("Failed to save event.", error);
      toast({ title: "保存失败，请稍后重试", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-heading">新聚餐记录</h2>
        
        <Card className="p-4 space-y-4 bg-white/50 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> 日期
              </label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> 地点
              </label>
              <Input 
                placeholder="例如: 海底捞" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          <Textarea 
            placeholder="备注描述..." 
            className="bg-white resize-none" 
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">选择人员</h3>
          <Badge variant="secondary" className="text-xs">
            已选: {count} 人
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-card" 
            placeholder="搜索..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {filteredMembers.map((member) => {
            const isSelected = selectedIds.has(member.id);
            return (
              <button
                key={member.id}
                onClick={() => toggleSelection(member.id)}
                className={cn(
                  "p-2 text-sm rounded-lg border transition-all duration-200 text-center truncate select-none",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]" 
                    : "bg-card hover:bg-muted text-foreground border-border"
                )}
              >
                {member.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-background/80 backdrop-blur-md border-t border-border shadow-lg space-y-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">积分/人:</span>
            <Input 
              type="number" 
              className="w-16 h-8 text-center font-bold"
              value={finalPoints}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setManualPoints(Math.min(20, Math.max(0, val)));
                else setManualPoints(null);
              }}
              max={20}
              min={0}
            />
            {manualPoints !== null && (
               <span className="text-xs text-muted-foreground">(手动)</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            规则: {count}人 = {calculatedPoints}分
          </div>
        </div>
        <Button className="w-full font-bold shadow-lg" size="lg" onClick={handleSubmit}>
          确认并保存
        </Button>
      </div>
    </div>
  );
}
