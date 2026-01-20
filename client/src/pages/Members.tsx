import { useState } from "react";
import { useStore } from "@/lib/store";
import { Search, UserPlus, Trash2, UserCheck, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Members() {
  const { members, addMember, deleteMember } = useStore();
  const [search, setSearch] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredMembers = members
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.active) - Number(a.active));
  
  const activeCount = members.filter((member) => member.active).length;

  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;
    try {
      const member = await addMember(newMemberName.trim());
      if (!member) return;
      setNewMemberName("");
      setIsDialogOpen(false);
      toast({
        title: "成功",
        description: `已添加成员: ${newMemberName}`,
      });
    } catch (error) {
      toast({ title: "失败", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`确定要停用 ${name} 吗?`)) {
      try {
        await deleteMember(id);
        toast({ title: "已停用", description: `已停用成员: ${name}` });
      } catch (error) {
        toast({ title: "错误", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-slate-900">
          成员管理 <span className="ml-2 text-sm font-medium text-slate-400">{activeCount}人活跃</span>
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm">
              <UserPlus className="h-4 w-4 mr-1.5" /> 添加
            </Button>
          </DialogTrigger>
          <DialogContent className="border-none rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">添加新成员</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input 
                value={newMemberName} 
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="输入成员姓名..."
                className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <Button onClick={handleAddMember} className="w-full h-12 rounded-xl font-bold bg-blue-600">确认添加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          className="pl-10 h-12 bg-white border-slate-200 rounded-xl shadow-sm font-medium" 
          placeholder="快速查找成员..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className={cn(
            "flex items-center justify-between p-4 border-slate-100 shadow-sm rounded-2xl transition-all",
            member.active ? "bg-white" : "bg-slate-50/50 opacity-60"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                member.active ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
              )}>
                {member.active ? <UserCheck className="h-5 w-5" /> : <UserMinus className="h-5 w-5" />}
              </div>
              <div>
                <span className="font-bold text-slate-900 leading-none">{member.name}</span>
                {!member.active && <p className="text-[10px] font-bold text-slate-400 mt-1">已停用</p>}
              </div>
            </div>
            {member.active && (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-9 w-9"
                onClick={() => handleDelete(member.id, member.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </Card>
        ))}
        {filteredMembers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400">查无此人</p>
          </div>
        )}
      </div>
    </div>
  );
}
