import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ProfileId, UserProfileView } from "../backend";
import { PostCard } from "../components/PostCard";
import { PostComposer } from "../components/PostComposer";
import { usePosts } from "../hooks/useQueries";

interface FeedPageProps {
  myProfile: UserProfileView | null;
  myPrincipal: ProfileId | null;
}

export function FeedPage({ myProfile, myPrincipal }: FeedPageProps) {
  const { data: posts = [], isLoading } = usePosts();

  return (
    <main className="space-y-4" data-ocid="feed.page">
      {/* Composer */}
      {myProfile && <PostComposer profile={myProfile} />}

      {/* Feed header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Latest Posts
        </h2>
        {posts.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {posts.length} posts
          </span>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-4" data-ocid="feed.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-lg border border-border card-shadow p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg border border-border card-shadow p-12 text-center"
          data-ocid="feed.empty_state"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Nothing here yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Be the first to share a photo or message with your friends!
          </p>
        </motion.div>
      )}

      {/* Posts */}
      <div className="space-y-4" data-ocid="feed.list">
        {posts.map((post, index) => (
          <PostCard
            key={post.id.toString()}
            post={post}
            myPrincipal={myPrincipal}
            index={index}
          />
        ))}
      </div>
    </main>
  );
}
