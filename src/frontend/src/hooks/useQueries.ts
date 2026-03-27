import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostId, ProfileId } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

// ── Queries ──────────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(userId: ProfileId | null | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePosts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPostsSorted();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useComments(postId: PostId | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["comments", postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
  });
}

export function useFriends() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriends();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMessages(recipient: ProfileId | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messages", recipient?.toString()],
    queryFn: async () => {
      if (!actor || !recipient) return [];
      return actor.getMessagesWith(recipient);
    },
    enabled: !!actor && !isFetching && !!recipient,
    refetchInterval: 5_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      avatarBytes,
    }: { displayName: string; avatarBytes?: Uint8Array }) => {
      if (!actor) throw new Error("Not connected");
      const avatar = avatarBytes
        ? ExternalBlob.fromBytes(avatarBytes as Uint8Array<ArrayBuffer>)
        : null;
      return actor.createProfile(displayName, avatar);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myProfile"] }),
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      avatarBytes,
    }: { displayName: string; avatarBytes?: Uint8Array }) => {
      if (!actor) throw new Error("Not connected");
      const avatar = avatarBytes
        ? ExternalBlob.fromBytes(avatarBytes as Uint8Array<ArrayBuffer>)
        : null;
      return actor.updateProfile(displayName, avatar);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myProfile"] }),
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      caption,
      photoBytes,
    }: { caption: string; photoBytes?: Uint8Array }) => {
      if (!actor) throw new Error("Not connected");
      const photo = photoBytes
        ? ExternalBlob.fromBytes(photoBytes as Uint8Array<ArrayBuffer>)
        : null;
      return actor.createPost(caption, photo);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error("Not connected");
      return actor.likePost(postId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error("Not connected");
      return actor.unlikePost(postId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, text }: { postId: PostId; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(postId, text);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["comments", vars.postId.toString()] }),
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipient,
      text,
    }: { recipient: ProfileId; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(recipient, text);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["messages", vars.recipient.toString()],
      }),
  });
}

export function useAddFriend() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (friend: ProfileId) => {
      if (!actor) throw new Error("Not connected");
      return actor.addFriend(friend);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends"] }),
  });
}

// helper: format timestamp (bigint nanoseconds → human readable)
export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ms).toLocaleDateString();
}
