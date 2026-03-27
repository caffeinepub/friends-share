import { Bell, Heart, MessageCircle } from "lucide-react";
import type { ProfileId, UserProfileView } from "../backend";
import { usePosts } from "../hooks/useQueries";
import { MessagesPanel } from "./MessagesPanel";

interface RightSidebarProps {
  myProfile: UserProfileView | null;
  myPrincipal: ProfileId | null;
  messageFriend?: ProfileId | null;
}

export function RightSidebar({
  myProfile,
  myPrincipal,
  messageFriend,
}: RightSidebarProps) {
  const { data: posts = [] } = usePosts();

  const myPosts = myPrincipal
    ? posts.filter((p) => p.author.toString() === myPrincipal.toString())
    : [];
  const recentLikes = myPosts
    .flatMap((p) =>
      p.likes.map((liker) => ({ postId: p.id, liker, caption: p.caption })),
    )
    .slice(0, 5);
  const recentComments = myPosts
    .flatMap((p) =>
      p.comments.map((cId) => ({
        commentId: cId.toString(),
        caption: p.caption,
      })),
    )
    .slice(0, 3);

  return (
    <aside className="space-y-4" data-ocid="sidebar.right.panel">
      {/* Messages */}
      <div className="bg-card rounded-lg border border-border card-shadow overflow-hidden">
        <MessagesPanel myProfile={myProfile} initialRecipient={messageFriend} />
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-lg border border-border card-shadow p-3">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notifications
          </h3>
        </div>

        {recentLikes.length === 0 && recentComments.length === 0 && (
          <p
            className="text-xs text-muted-foreground text-center py-3"
            data-ocid="notifications.empty_state"
          >
            No notifications yet
          </p>
        )}

        <div className="space-y-2">
          {recentLikes.map((n, i) => (
            <div
              key={`like-${n.postId.toString()}-${n.liker.toString()}`}
              className="flex items-center gap-2"
              data-ocid={`notifications.item.${i + 1}`}
            >
              <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-3.5 h-3.5 text-destructive" />
              </div>
              <p className="text-xs text-foreground">
                Someone liked your post
                {n.caption ? ` "${n.caption.slice(0, 20)}..."` : ""}
              </p>
            </div>
          ))}
          {recentComments.map((n, i) => (
            <div
              key={`comment-${n.commentId}`}
              className="flex items-center gap-2"
              data-ocid={`notifications.item.${recentLikes.length + i + 1}`}
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-xs text-foreground">
                New comment on your post
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
