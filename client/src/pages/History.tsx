import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { MapPin, Users, Trash2, Globe, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function History() {
  const { events, members, deleteEvent } = useStore();
  const { toast } = useToast();
  const [ipLocations, setIpLocations] = useState<Record<string, string>>({});

  const getMemberNames = (ids: string[]) => {
    return ids
      .map((id) => members.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  useEffect(() => {
    const ips = Array.from(
      new Set(events.map((event) => event.ipAddress).filter(Boolean)),
    ) as string[];
    const missingIps = ips.filter((ip) => !ipLocations[ip]);
    if (missingIps.length === 0) return;

    let cancelled = false;
    const fetchLocations = async () => {
      await Promise.all(
        missingIps.map(async (ip) => {
          try {
            const res = await fetch(`/api/ip-location?ip=${encodeURIComponent(ip)}`);
            if (!res.ok) throw new Error(`IP lookup failed: ${res.status}`);
            const data = await res.json();
            if (!cancelled && data?.location) {
              setIpLocations((current) => ({ ...current, [ip]: data.location }));
            }
          } catch (error) {
            console.error("Failed to fetch IP location.", error);
            if (!cancelled) setIpLocations((current) => ({ ...current, [ip]: "未知" }));
          }
        }),
      );
    };
    fetchLocations();
    return () => { cancelled = true; };
  }, [events, ipLocations]);

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这条记录吗？")) {
      try {
        await deleteEvent(id);
        toast({ title: "已删除记录" });
      } catch (error) {
        toast({ title: "删除失败", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <h2 className="text-3xl font-black font-heading tracking-tighter uppercase italic px-1">
        日志 <span className="text-primary/40 not-italic">LOGS</span>
      </h2>

      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="text-center py-24 glass rounded-[2rem] border-none shadow-soft">
            <History className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">暂无聚餐记录</p>
          </div>
        ) : (
          events.map((event, idx) => {
            const createdAtText = event.createdAt
              ? format(new Date(event.createdAt), "MM-dd HH:mm")
              : "未知";
            const ipLocation = event.ipAddress ? ipLocations[event.ipAddress] ?? "LOCATING..." : "UNKNOWN";

            return (
              <Card key={event.id} className="border-none shadow-soft rounded-[2.5rem] overflow-hidden bg-white relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Hash className="w-24 h-24 rotate-12" />
                </div>
                
                <CardHeader className="p-7 pb-0 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-primary" />
                         <h3 className="font-black text-2xl font-heading tracking-tighter uppercase leading-none">
                          {format(new Date(event.date), "MM/dd")}
                        </h3>
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest pl-4">
                        <MapPin className="h-2.5 w-2.5" /> {event.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black font-heading text-primary leading-none">+{event.points}</div>
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">PTS / PERSON</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-7 pt-5 relative z-10">
                  <div className="mb-6 text-sm font-bold text-foreground/70 bg-secondary/30 p-4 rounded-2xl italic border-l-4 border-primary">
                    "{event.description}"
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass p-3 rounded-2xl shadow-sm border-none">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <Clock className="h-2.5 w-2.5" /> 提交时间
                      </div>
                      <div className="text-[11px] font-black text-primary uppercase">{createdAtText}</div>
                    </div>
                    <div className="glass p-3 rounded-2xl shadow-sm border-none">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <Globe className="h-2.5 w-2.5" /> 网络归属
                      </div>
                      <div className="text-[11px] font-black text-primary uppercase truncate">{ipLocation}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      <Users className="h-2.5 w-2.5" />
                      参与名单 ({event.attendees.length}人)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {event.attendees.map(id => {
                        const name = members.find(m => m.id === id)?.name;
                        return name && (
                          <span key={id} className="text-[10px] font-black bg-secondary px-3 py-1 rounded-full uppercase tracking-tight">
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed flex justify-end">
                     <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> 删除该记录
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
