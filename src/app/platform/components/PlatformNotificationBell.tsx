import { Bell } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../shared/components/ui/popover";
import { cn } from "../../shared/components/ui/utils";
import { usePlatformOperatorExperience } from "../context/PlatformOperatorExperienceContext";
import { formatOperatorTimestamp } from "../data/platformOperatorProfile";

export function PlatformNotificationBell() {
  const { notifications, unreadCount, markNotificationRead } = usePlatformOperatorExperience();
  const latest = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-accent" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full",
                "bg-destructive px-0.5 text-[10px] font-semibold text-destructive-foreground",
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0" align="end" sideOffset={8}>
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="text-[11px] text-muted-foreground">
            {unreadCount === 0 ? "No unread items" : `${unreadCount} unread`}
          </p>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {latest.map((n) => (
            <li key={n.id} className="border-b border-border last:border-0">
              <Link
                to={n.link}
                onClick={() => {
                  if (!n.read) markNotificationRead(n.id);
                }}
                className="block px-3 py-2.5 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-[13px] leading-snug", !n.read ? "font-semibold text-foreground" : "text-foreground")}>
                    {n.title}
                  </p>
                  {!n.read ? <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden /> : null}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{n.description}</p>
                <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">{formatOperatorTimestamp(n.timestamp)}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="h-8 w-full justify-center text-xs" asChild>
            <Link to="/platform-notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
