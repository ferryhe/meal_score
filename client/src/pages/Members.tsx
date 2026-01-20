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
        title: "SUCCESS",
        description: `已添加成员: ${newMemberName}`,
      });
    } catch (error) {
      toast({ title: "FAILED", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`确定要停用 ${name} 吗?`)) {
      try {
        await deleteMember(id);
        toast({ title: "DONE", description: `已停用成员: ${name}` });
      } catch (error) {
        toast({ title: "ERROR", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-3xl font-black font-heading tracking-tighter uppercase italic">
          成员 <span className="text-primary/40 not-italic">CREW</span>
          <span className="ml-3 text-xs not-italic bg-primary/10 text-primary px-2 py-1 rounded-full">{activeCount}</span>
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-90">
              <UserPlus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-none rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">入伙新成员</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-6">
              <Input 
                value={newMemberName} 
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="成员大名..."
                className="h-14 bg-secondary/50 border-none rounded-2xl font-bold px-5"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <Button onClick={handleAddMember} className="w-full h-14 rounded-2xl font-black text-lg">确认添加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          className="pl-11 bg-white border-none h-14 rounded-2xl shadow-sm font-medium" 
          placeholder="查找队友..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className={cn(
            "flex items-center justify-between p-5 border-none shadow-sm hover:shadow-soft transition-all duration-300 rounded-[1.8rem] group overflow-hidden",
            member.active ? "bg-white" : "bg-white/40 opacity-60"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                member.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {member.active ? <UserCheck className="h-5 w-5" /> : <UserMinus className="h-5 w-5" />}
              </div>
              <div>
                <span className="font-black text-lg tracking-tight uppercase group-hover:text-primary transition-colors">{member.name}</span>
                {!member.active && <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">DISABLED MEMBER</div>}
              </div>
            </div>
            {member.active && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => handleDelete(member.id, member.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </Card>
        ))}
        {filteredMembers.length === 0 && (
          <div className="text-center py-20 glass rounded-[2rem] border-none">
            <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">查无此人</p>
          </div>
        )}
      </div>
    </div>
  );
}
