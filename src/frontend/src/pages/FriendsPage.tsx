import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ProfileId } from "../backend";
import { useAddFriend, useFriends, useUserProfile } from "../hooks/useQueries";

function FriendCard({
  friendId,
  index,
}: { friendId: ProfileId; index: number }) {
  const { data: profile } = useUserProfile(friendId);
  const initials = profile?.displayName?.slice(0, 2).toUpperCase() ?? "?";
  const avatarUrl = profile?.avatar?.getDirectURL();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border card-shadow"
      data-ocid={`friends.item.${index + 1}`}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-3 h-3 online-dot rounded-full border-2 border-card" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">
          {profile?.displayName ?? "Friend"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {friendId.toString().slice(0, 20)}...
        </p>
      </div>
      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
        Friend
      </span>
    </motion.div>
  );
}

export function FriendsPage() {
  const [principalInput, setPrincipalInput] = useState("");
  const { data: friends = [], isLoading } = useFriends();
  const addFriend = useAddFriend();

  async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault();
    if (!principalInput.trim()) return;
    try {
      const principal = Principal.fromText(principalInput.trim());
      await addFriend.mutateAsync(principal);
      setPrincipalInput("");
      toast.success("Friend added!");
    } catch {
      toast.error("Invalid principal ID or failed to add friend");
    }
  }

  return (
    <main className="space-y-6" data-ocid="friends.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Friends</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with people you know
        </p>
      </div>

      {/* Add friend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Add a Friend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddFriend} className="flex gap-3">
            <div className="flex-1">
              <Label
                htmlFor="principalId"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Enter their Principal ID
              </Label>
              <Input
                id="principalId"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                placeholder="aaaaa-bbbbb-ccccc-ddddd-eee"
                className="font-mono text-sm"
                data-ocid="friends.add.input"
              />
            </div>
            <Button
              type="submit"
              className="mt-5"
              disabled={!principalInput.trim() || addFriend.isPending}
              data-ocid="friends.add.submit_button"
            >
              {addFriend.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Friends list */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Your Friends ({friends.length})
        </h3>

        {isLoading && (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="friends.loading_state"
          >
            Loading...
          </p>
        )}

        {!isLoading && friends.length === 0 && (
          <div
            className="text-center py-12 bg-card rounded-lg border border-border"
            data-ocid="friends.empty_state"
          >
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">No friends yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a friend using their Principal ID above
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {friends.map((id, i) => (
            <FriendCard key={id.toString()} friendId={id} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
