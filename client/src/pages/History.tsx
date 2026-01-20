import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { MapPin, Users, Trash2 } from "lucide-react";
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
    if (missingIps.length === 0) {
      return;
    }

    let cancelled = false;

    const fetchLocations = async () => {
      await Promise.all(
        missingIps.map(async (ip) => {
          try {
            const res = await fetch(`/api/ip-location?ip=${encodeURIComponent(ip)}`);
            if (!res.ok) {
              throw new Error(`IP lookup failed: ${res.status}`);
            }
            const data = await res.json();
            if (!cancelled && data?.location) {
              setIpLocations((current) => ({ ...current, [ip]: data.location }));
            }
          } catch (error) {
            console.error("Failed to fetch IP location.", error);
            if (!cancelled) {
              setIpLocations((current) => ({ ...current, [ip]: "未知" }));
            }
          }
        }),
      );
    };

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [events, ipLocations]);

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这条记录吗？删除后积分将重新计算。")) {
      try {
        await deleteEvent(id);
        toast({ title: "已删除记录" });
      } catch (error) {
        console.error("Failed to delete event.", error);
        toast({ title: "删除失败，请稍后重试", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-heading">历史记录</h2>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            暂无聚餐记录
          </div>
        ) : (
          events.map((event) => {
            const createdAtText = event.createdAt
              ? format(new Date(event.createdAt), "yyyy年MM月dd日 HH:mm")
              : "未知";
            const ipAddress = event.ipAddress ?? "未知";
            const ipLocation = event.ipAddress
              ? ipLocations[event.ipAddress] ?? "查询中..."
              : "未知";

            return (
              <Card key={event.id} className="overflow-hidden group">
                <CardHeader className="bg-muted/30 p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">
                        {format(new Date(event.date), "yyyy年MM月dd日")}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">+{event.points}</div>
                      <div className="text-xs text-muted-foreground">每人积分</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="mb-3 text-sm italic text-muted-foreground border-l-2 pl-3 my-2">
                    {event.description}
                  </div>

                  <div className="mb-3 text-xs text-muted-foreground space-y-1">
                    <div>提交时间: {createdAtText}</div>
                    <div>IP: {ipAddress} · 归属地: {ipLocation}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Users className="h-3 w-3" />
                      参与人员 ({event.attendees.length}人)
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 break-words">
                      {getMemberNames(event.attendees)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-8 px-2"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> 删除记录
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
