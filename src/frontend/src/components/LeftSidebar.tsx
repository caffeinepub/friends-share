import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Users } from "lucide-react";
import type { ProfileId, UserProfileView } from "../backend";
import { useFriends, useUserProfile } from "../hooks/useQueries";

interface FriendRowProps {
  friendId: ProfileId;
  index: number;
  onMessage: (id: ProfileId) => void;
}

function FriendRow({ friendId, index, onMessage }: FriendRowProps) {
  const { data: profile } = useUserProfile(friendId);
  const initials = profile?.displayName?.slice(0, 2).toUpperCase() ?? "?";
  const avatarUrl = profile?.avatar?.getDirectURL();

  return (
    <button
      type="button"
      onClick={() => onMessage(friendId)}
      className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md hover:bg-muted/50 transition-colors group"
      data-ocid={`friends.item.${index + 1}`}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-8 h-8">
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 online-dot rounded-full border-2 border-card" />
      </div>
      <span className="text-sm font-medium text-foreground truncate">
        {profile?.displayName ?? "..."}
      </span>
    </button>
  );
}

interface LeftSidebarProps {
  myProfile: UserProfileView | null;
  onMessageFriend: (id: ProfileId) => void;
  onGoFriends: () => void;
}

export function LeftSidebar({
  myProfile,
  onMessageFriend,
  onGoFriends,
}: LeftSidebarProps) {
  const { data: friends = [], isLoading } = useFriends();
  const avatarUrl = myProfile?.avatar?.getDirectURL();
  const initials = myProfile?.displayName?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <aside className="space-y-4" data-ocid="sidebar.left.panel">
      {/* My profile card */}
      <div className="bg-card rounded-lg border border-border card-shadow p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="bg-primary text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {myProfile?.displayName ?? "My Profile"}
            </p>
            <p className="text-xs text-muted-foreground">
              {friends.length} friends
            </p>
          </div>
        </div>
      </div>

      {/* Friends list */}
      <div className="bg-card rounded-lg border border-border card-shadow p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Friends Online
          </h3>
          <span className="text-xs text-muted-foreground">
            {friends.length}
          </span>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && friends.length === 0 && (
          <div className="text-center py-4" data-ocid="friends.empty_state">
            <Users className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1" />
            <p className="text-xs text-muted-foreground">No friends yet</p>
          </div>
        )}

        <div className="space-y-0.5">
          {friends.slice(0, 8).map((id, i) => (
            <FriendRow
              key={id.toString()}
              friendId={id}
              index={i}
              onMessage={onMessageFriend}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 text-xs"
          onClick={onGoFriends}
          data-ocid="sidebar.add_friend.button"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Add Friend
        </Button>
      </div>
    </aside>
  );
}
