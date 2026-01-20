import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
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
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">填写聚餐记录</h2>
        
        <Card className="p-5 space-y-4 border-slate-100 shadow-sm rounded-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> 日期
              </label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-slate-50 border-slate-100 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> 地点
              </label>
              <Input 
                placeholder="例如: 牛肉面馆" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 bg-slate-50 border-slate-100 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
             <label className="text-xs font-medium text-slate-500">备注</label>
             <Textarea 
                placeholder="备注说明..." 
                className="bg-slate-50 border-slate-100 rounded-xl resize-none min-h-[80px]" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">选择人员 ({count})</h3>
          {count > 0 && <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold">已选: {count}</Badge>}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            className="pl-10 h-12 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-blue-500" 
            placeholder="搜索姓名..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {filteredMembers.map((member) => {
            const isSelected = selectedIds.has(member.id);
            return (
              <button
                key={member.id}
                onClick={() => toggleSelection(member.id)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 text-center truncate",
                  isSelected 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-[1.02]" 
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                )}
              >
                {member.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-[20px] shadow-xl flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">人均积分</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                className="w-10 bg-transparent text-xl font-bold text-slate-900 outline-none"
                value={finalPoints}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) setManualPoints(Math.min(20, Math.max(0, val)));
                  else setManualPoints(null);
                }}
              />
              <span className="text-xs font-medium text-slate-400">分</span>
            </div>
          </div>
          
          <Button 
            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100" 
            onClick={handleSubmit}
          >
            保存记录
          </Button>
        </div>
      </div>
    </div>
  );
}
