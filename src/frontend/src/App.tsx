import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import type { ProfileId } from "./backend";
import { Header } from "./components/Header";
import { LeftSidebar } from "./components/LeftSidebar";
import { MessagesPanel } from "./components/MessagesPanel";
import { RightSidebar } from "./components/RightSidebar";
import { SetupProfileModal } from "./components/SetupProfileModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useMyProfile } from "./hooks/useQueries";
import { FeedPage } from "./pages/FeedPage";
import { FriendsPage } from "./pages/FriendsPage";
import { LoginPage } from "./pages/LoginPage";

type Tab = "feed" | "messages" | "friends";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: myProfile, isLoading: profileLoading } = useMyProfile();
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [messageFriend, setMessageFriend] = useState<ProfileId | null>(null);

  const isLoggedIn = !!identity;
  const myPrincipal = identity?.getPrincipal() ?? null;
  const needsProfile = isLoggedIn && !profileLoading && myProfile === null;
  const showSetup = needsProfile;

  // When a friend is clicked from sidebar, switch to messages tab
  function handleMessageFriend(id: ProfileId) {
    setMessageFriend(id);
    setActiveTab("messages");
  }

  // Reset messageFriend when tab changes away from messages
  useEffect(() => {
    if (activeTab !== "messages") {
      setMessageFriend(null);
    }
  }, [activeTab]);

  const notificationCount = 0; // could be computed from likes/comments on my posts

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "oklch(0.96 0.004 265)" }}
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "oklch(0.962 0.004 265)" }}
    >
      <Toaster richColors />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={myProfile ?? null}
        notificationCount={notificationCount}
      />

      {/* Setup modal */}
      {showSetup && <SetupProfileModal open={showSetup} />}

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
          {/* Left sidebar */}
          <div className="hidden lg:block">
            <LeftSidebar
              myProfile={myProfile ?? null}
              onMessageFriend={handleMessageFriend}
              onGoFriends={() => setActiveTab("friends")}
            />
          </div>

          {/* Center content */}
          <div className="min-w-0">
            {activeTab === "feed" && (
              <FeedPage
                myProfile={myProfile ?? null}
                myPrincipal={myPrincipal}
              />
            )}
            {activeTab === "messages" && (
              <div
                className="bg-card rounded-lg border border-border card-shadow overflow-hidden"
                data-ocid="messages.page"
              >
                <MessagesPanel
                  myProfile={myProfile ?? null}
                  initialRecipient={messageFriend}
                />
              </div>
            )}
            {activeTab === "friends" && <FriendsPage />}
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block">
            <RightSidebar
              myProfile={myProfile ?? null}
              myPrincipal={myPrincipal}
              messageFriend={messageFriend}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FriendsShare. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
