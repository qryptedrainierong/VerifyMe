import { Activity, Bell, ChevronDown, LogOut, Shield, SlidersHorizontal, User } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../shared/components/ui/dropdown-menu";
import { PLATFORM_PREVIEW_USER, usePlatformRole } from "../context/PlatformRoleContext";
import { PLATFORM_ROLES, platformRoleDescription, platformRoleLabel, type PlatformRole } from "../utils/platformRolePermissions";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

export function PlatformUserMenu() {
  const { role, setRole } = usePlatformRole();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-md px-1.5 hover:bg-accent sm:gap-2 sm:px-2 max-w-[min(100vw-10rem,15rem)]"
          aria-label="Account and preview role menu"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials(PLATFORM_PREVIEW_USER.displayName)}
          </span>
          <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
            <span className="max-w-[9.5rem] truncate text-[12px] font-medium text-foreground">
              {PLATFORM_PREVIEW_USER.displayName}
            </span>
            <span className="max-w-[9.5rem] truncate text-[10px] text-muted-foreground">{platformRoleLabel(role)}</span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" sideOffset={6}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initials(PLATFORM_PREVIEW_USER.displayName)}
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold text-foreground leading-none">{PLATFORM_PREVIEW_USER.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{PLATFORM_PREVIEW_USER.email}</p>
              <p className="text-xs text-muted-foreground pt-1">
                <span className="font-medium text-foreground">{platformRoleLabel(role)}</span>
                <span className="block mt-1 text-[11px] leading-snug">{platformRoleDescription(role)}</span>
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/platform-profile" className="cursor-pointer">
            <User className="h-4 w-4" />
            View profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/platform-security" className="cursor-pointer">
            <Shield className="h-4 w-4" />
            Security settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/platform-notifications" className="cursor-pointer">
            <Bell className="h-4 w-4" />
            Notification preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/platform-preferences" className="cursor-pointer">
            <SlidersHorizontal className="h-4 w-4" />
            Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/platform-security#active-sessions" className="cursor-pointer">
            <Activity className="h-4 w-4" />
            Session activity
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Preview role</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as PlatformRole)}>
            {PLATFORM_ROLES.map((r) => (
              <DropdownMenuRadioItem key={r} value={r} className="text-sm">
                {platformRoleLabel(r)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex flex-col items-start gap-0.5 py-2 opacity-60">
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </span>
          <span className="pl-6 text-[10px] leading-snug text-muted-foreground">
            Not connected · requires backend authentication
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
