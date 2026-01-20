import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { MapPin, Users, Trash2, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <h2 className="text-xl font-bold text-slate-900 px-1">历史记录</h2>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400">暂无聚餐记录</p>
          </div>
        ) : (
          events.map((event) => {
            const createdAtText = event.createdAt
              ? format(new Date(event.createdAt), "MM-dd HH:mm")
              : "未知";
            const ipLocation = event.ipAddress ? ipLocations[event.ipAddress] ?? "查询中..." : "未知";

            return (
              <Card key={event.id} className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 p-5 border-b border-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 leading-none">
                        {format(new Date(event.date), "yyyy年MM月dd日")}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-slate-400" /> {event.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600 leading-none">+{event.points}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">人均积分</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl">
                    {event.description}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mb-0.5 uppercase">
                        <Clock className="h-2.5 w-2.5" /> 提交时间
                      </div>
                      <div className="text-[11px] font-bold text-slate-700">{createdAtText}</div>
                    </div>
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mb-0.5 uppercase">
                        <Globe className="h-2.5 w-2.5" /> 归属地
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 truncate">{ipLocation}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <Users className="h-3 w-3" />
                      参与名单 ({event.attendees.length}人)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {event.attendees.map(id => {
                        const name = members.find(m => m.id === id)?.name;
                        return name && (
                          <span key={id} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-end">
                     <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 px-3 rounded-lg text-xs font-bold"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> 删除记录
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
