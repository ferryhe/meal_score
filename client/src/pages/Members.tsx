import { useState } from "react";
import { useStore } from "@/lib/store";
import { Search, UserPlus, Trash2 } from "lucide-react";
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
        title: "添加成功",
        description: `已添加成员: ${newMemberName}`,
      });
    } catch (error) {
      console.error("Failed to add member.", error);
      toast({ title: "添加失败，请稍后重试", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`确定要停用 ${name} 吗?`)) {
      try {
        await deleteMember(id);
        toast({
          title: "已停用成员",
          description: `已停用成员: ${name}`,
        });
      } catch (error) {
        console.error("Failed to delete member.", error);
        toast({ title: "停用失败，请稍后重试", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-heading text-foreground">群成员 ({activeCount})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              添加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新成员</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Input 
                value={newMemberName} 
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="输入姓名"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <Button onClick={handleAddMember}>确定</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-9 bg-card" 
          placeholder="搜索成员..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="flex items-center justify-between p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{member.name}</span>
              {!member.active && <Badge variant="secondary">已停用</Badge>}
            </div>
            {member.active && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(member.id, member.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </Card>
        ))}
        {filteredMembers.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            没有找到相关成员
          </div>
        )}
      </div>
    </div>
  );
}
