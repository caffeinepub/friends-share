import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PostView, ProfileId } from "../backend";
import {
  formatTimestamp,
  useAddComment,
  useComments,
  useLikePost,
  useUnlikePost,
  useUserProfile,
} from "../hooks/useQueries";

interface PostCardProps {
  post: PostView;
  myPrincipal: ProfileId | null;
  index: number;
}

export function PostCard({ post, myPrincipal, index }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: author } = useUserProfile(post.author);
  const { data: comments = [] } = useComments(showComments ? post.id : null);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const addComment = useAddComment();

  const isLiked = myPrincipal
    ? post.likes.some((p) => p.toString() === myPrincipal.toString())
    : false;

  const photoUrl = post.photo?.getDirectURL();
  const authorInitials = author?.displayName?.slice(0, 2).toUpperCase() ?? "?";
  const authorAvatar = author?.avatar?.getDirectURL();

  function handleLike() {
    if (isLiked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
    }
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate({ postId: post.id, text: commentText.trim() });
    setCommentText("");
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="bg-card rounded-lg border border-border card-shadow overflow-hidden"
      data-ocid={`feed.item.${index + 1}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="w-10 h-10">
          {authorAvatar && <AvatarImage src={authorAvatar} />}
          <AvatarFallback className="bg-primary text-white font-semibold text-sm">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {author?.displayName ?? "Loading..."}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(post.timestamp)}
          </p>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="px-4 pb-3 text-sm text-foreground leading-relaxed">
          {post.caption}
        </p>
      )}

      {/* Photo */}
      {photoUrl && (
        <div className="w-full">
          <img
            src={photoUrl}
            alt=""
            className="w-full object-cover max-h-[480px]"
            loading="lazy"
          />
        </div>
      )}

      {/* Engagement counts */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground border-t border-border">
        <span>
          {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
        </span>
        <span>
          {post.comments.length}{" "}
          {post.comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-border">
        <button
          type="button"
          onClick={handleLike}
          disabled={!myPrincipal}
          data-ocid={`feed.like.button.${index + 1}`}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50",
            isLiked ? "text-destructive" : "text-muted-foreground",
          ].join(" ")}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          Like
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          data-ocid={`feed.comment.button.${index + 1}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          type="button"
          data-ocid={`feed.share.button.${index + 1}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-3 space-y-2">
              {comments.map((c) => (
                <div key={c.id.toString()} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground">
                      U
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-1.5 flex-1">
                    <p className="text-xs text-foreground">{c.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  No comments yet
                </p>
              )}
              <form onSubmit={handleComment} className="flex gap-2 mt-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="text-xs h-8"
                  data-ocid={`feed.comment.input.${index + 1}`}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-2"
                  disabled={!commentText.trim() || addComment.isPending}
                  data-ocid={`feed.comment.submit.${index + 1}`}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
