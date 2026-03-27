import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageSquare,
  Rss,
  Search,
  User,
  Users,
} from "lucide-react";
import type { UserProfileView } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Tab = "feed" | "messages" | "friends";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  profile: UserProfileView | null;
  notificationCount?: number;
}

export function Header({
  activeTab,
  onTabChange,
  profile,
  notificationCount = 0,
}: HeaderProps) {
  const { clear } = useInternetIdentity();

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "feed", label: "Feed", icon: <Rss className="w-4 h-4" /> },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    { id: "friends", label: "Friends", icon: <Users className="w-4 h-4" /> },
  ];

  const initials = profile?.displayName
    ? profile.displayName.slice(0, 2).toUpperCase()
    : "?";

  const avatarUrl = profile?.avatar ? profile.avatar.getDirectURL() : undefined;

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: "oklch(0.19 0.018 265)" }}
      data-ocid="header.panel"
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-white">FS</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
            Friends<span className="text-primary">Share</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search friends..."
              className="pl-9 h-8 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30"
              data-ocid="header.search_input"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              data-ocid={`header.${item.id}.tab`}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              ].join(" ")}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            data-ocid="header.notifications.button"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 badge-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 p-1 rounded-md hover:bg-white/10 transition-colors"
                data-ocid="header.user.button"
              >
                <Avatar className="w-7 h-7">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="bg-primary text-xs font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white/80 text-sm hidden sm:block max-w-[100px] truncate">
                  {profile?.displayName ?? "Me"}
                </span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem data-ocid="header.profile.button">
                <User className="mr-2 w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={clear}
                className="text-destructive focus:text-destructive"
                data-ocid="header.logout.button"
              >
                <LogOut className="mr-2 w-4 h-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
