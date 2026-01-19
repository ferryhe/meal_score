import { useState } from "react";
import { useStore } from "@/lib/store";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    addMember(newMemberName.trim());
    setNewMemberName("");
    setIsDialogOpen(false);
    toast({
      title: "添加成功",
      description: `已添加成员: ${newMemberName}`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除 ${name} 吗?`)) {
      deleteMember(id);
      toast({
        title: "删除成功",
        description: `已删除成员: ${name}`,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-heading text-foreground">群成员 ({members.length})</h2>
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
            <span className="font-medium text-lg">{member.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(member.id, member.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
