import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Calendar as CalendarIcon, MapPin, Search, Users as UsersIcon } from "lucide-react";
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
    m.active && m.name.toLowerCase().includes(search.toLowerCase())
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h2 className="text-3xl font-black font-heading tracking-tighter text-foreground">发布 <span className="text-primary/40">ENTRY</span></h2>
        
        <Card className="p-6 space-y-5 bg-white shadow-soft border-none rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                <CalendarIcon className="h-3 w-3" /> 日期
              </label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-secondary/50 border-none rounded-xl h-12 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                <MapPin className="h-3 w-3" /> 地点
              </label>
              <Input 
                placeholder="地点..." 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="bg-secondary/50 border-none rounded-xl h-12 font-medium"
              />
            </div>
          </div>
          <div className="relative z-10 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">备注说明</label>
            <Textarea 
              placeholder="添加一些细节描述..." 
              className="bg-secondary/50 border-none rounded-xl resize-none min-h-[80px] p-3 font-medium" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-xl font-heading tracking-tight flex items-center gap-2">
            人员选择 <span className="text-primary/20 text-sm font-bold">/ ATTENDEES</span>
          </h3>
          <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-1 rounded-full">
            {count}
          </Badge>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            className="pl-11 bg-white border-none h-14 rounded-2xl shadow-sm focus-visible:ring-primary/20 font-medium" 
            placeholder="快速检索姓名..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 pt-2">
          {filteredMembers.map((member) => {
            const isSelected = selectedIds.has(member.id);
            return (
              <button
                key={member.id}
                onClick={() => toggleSelection(member.id)}
                className={cn(
                  "h-14 px-2 text-xs font-black rounded-2xl border-2 transition-all duration-300 flex items-center justify-center text-center leading-tight uppercase tracking-tight overflow-hidden",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.05] z-10" 
                    : "bg-white hover:bg-secondary text-foreground border-transparent shadow-sm"
                )}
              >
                {member.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-5 z-40 pointer-events-none">
        <Card className="glass border-none shadow-soft rounded-[2.5rem] p-4 flex items-center justify-between gap-4 pointer-events-auto ring-1 ring-black/5">
          <div className="flex flex-col pl-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">人均积分</span>
              {manualPoints !== null && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <div className="flex items-end gap-1.5">
              <input 
                type="number" 
                className="w-12 bg-transparent text-2xl font-black font-heading outline-none text-primary"
                value={finalPoints}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) setManualPoints(Math.min(20, Math.max(0, val)));
                  else setManualPoints(null);
                }}
              />
              <span className="text-xs font-bold text-muted-foreground pb-1">POINTS</span>
            </div>
          </div>
          
          <Button 
            className="h-16 px-10 rounded-[1.8rem] font-black tracking-tighter text-lg shadow-lg shadow-primary/30 transition-transform active:scale-95" 
            size="lg" 
            onClick={handleSubmit}
          >
            确认并发布
          </Button>
        </Card>
      </div>
    </div>
  );
}
