import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfileView } from "../backend";
import { useCreatePost } from "../hooks/useQueries";

interface PostComposerProps {
  profile: UserProfileView | null;
}

export function PostComposer({ profile }: PostComposerProps) {
  const [caption, setCaption] = useState("");
  const [photoBytes, setPhotoBytes] = useState<Uint8Array | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  const initials = profile?.displayName?.slice(0, 2).toUpperCase() ?? "?";
  const avatarUrl = profile?.avatar?.getDirectURL();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    setPhotoBytes(bytes);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caption.trim() && !photoBytes) return;
    try {
      await createPost.mutateAsync({ caption: caption.trim(), photoBytes });
      setCaption("");
      setPhotoBytes(undefined);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Post shared!");
    } catch {
      toast.error("Failed to create post");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-lg border border-border card-shadow p-4"
      data-ocid="composer.panel"
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback className="bg-primary text-white font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`What's on your mind, ${profile?.displayName ?? "friend"}?`}
            className="resize-none min-h-[80px] text-sm bg-input border-border focus:border-primary"
            data-ocid="composer.textarea"
          />
          {photoPreview && (
            <div className="relative inline-block">
              <img
                src={photoPreview}
                alt="Preview"
                className="rounded-md max-h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(photoPreview);
                  setPhotoPreview(null);
                  setPhotoBytes(undefined);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              data-ocid="composer.upload_button"
            >
              <Image className="w-4 h-4" />
              Add Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                (!caption.trim() && !photoBytes) || createPost.isPending
              }
              data-ocid="composer.submit_button"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
