import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useState } from "react";
import type { ProfileId, UserProfileView } from "../backend";
import {
  formatTimestamp,
  useFriends,
  useMessages,
  useSendMessage,
  useUserProfile,
} from "../hooks/useQueries";

interface FriendItemProps {
  friendId: ProfileId;
  index: number;
  onSelect: (id: ProfileId) => void;
}

function FriendItem({ friendId, index, onSelect }: FriendItemProps) {
  const { data: profile } = useUserProfile(friendId);
  const initials = profile?.displayName?.slice(0, 2).toUpperCase() ?? "?";
  const avatarUrl = profile?.avatar?.getDirectURL();

  return (
    <button
      type="button"
      onClick={() => onSelect(friendId)}
      className="flex items-center gap-3 w-full p-3 hover:bg-muted/50 rounded-md transition-colors"
      data-ocid={`messages.item.${index + 1}`}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-10 h-10">
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 online-dot rounded-full border-2 border-card" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-sm truncate">
          {profile?.displayName ?? "Friend"}
        </p>
        <p className="text-xs text-muted-foreground truncate">Click to chat</p>
      </div>
    </button>
  );
}

interface ChatViewProps {
  recipientId: ProfileId;
  myProfile: UserProfileView | null;
  onBack: () => void;
}

function ChatView({ recipientId, myProfile, onBack }: ChatViewProps) {
  const [text, setText] = useState("");
  const { data: messages = [] } = useMessages(recipientId);
  const { data: recipient } = useUserProfile(recipientId);
  const sendMessage = useSendMessage();

  const myPrincipal = myProfile ? String(myProfile.id) : null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage.mutateAsync({
      recipient: recipientId,
      text: text.trim(),
    });
    setText("");
  }

  return (
    <div className="flex flex-col h-full" data-ocid="messages.chat.panel">
      {/* Chat header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          data-ocid="messages.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
            {recipient?.displayName?.slice(0, 2).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm">
          {recipient?.displayName ?? "Chat"}
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {messages.length === 0 && (
            <p
              className="text-xs text-muted-foreground text-center py-4"
              data-ocid="messages.empty_state"
            >
              No messages yet. Say hello!
            </p>
          )}
          {messages.map((msg) => {
            const isMine = myPrincipal && msg.sender.toString() === myPrincipal;
            return (
              <div
                key={msg.id.toString()}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={[
                    "max-w-[75%] px-3 py-2 rounded-xl text-sm",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm",
                  ].join(" ")}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isMine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-border flex gap-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="text-sm h-9"
          data-ocid="messages.input"
        />
        <Button
          type="submit"
          size="sm"
          className="h-9 px-3"
          disabled={!text.trim() || sendMessage.isPending}
          data-ocid="messages.send.button"
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}

interface MessagesPanelProps {
  myProfile: UserProfileView | null;
  initialRecipient?: ProfileId | null;
}

export function MessagesPanel({
  myProfile,
  initialRecipient = null,
}: MessagesPanelProps) {
  const [selectedFriend, setSelectedFriend] = useState<ProfileId | null>(
    initialRecipient,
  );
  const { data: friends = [] } = useFriends();

  if (selectedFriend) {
    return (
      <ChatView
        recipientId={selectedFriend}
        myProfile={myProfile}
        onBack={() => setSelectedFriend(null)}
      />
    );
  }

  return (
    <div data-ocid="messages.list.panel">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm">Messages</h3>
      </div>
      {friends.length === 0 && (
        <div className="p-6 text-center" data-ocid="messages.empty_state">
          <p className="text-sm text-muted-foreground">
            Add friends to start messaging
          </p>
        </div>
      )}
      {friends.map((id, i) => (
        <FriendItem
          key={id.toString()}
          friendId={id}
          index={i}
          onSelect={setSelectedFriend}
        />
      ))}
    </div>
  );
}
