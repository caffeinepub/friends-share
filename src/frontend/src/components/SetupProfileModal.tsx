import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateProfile } from "../hooks/useQueries";

interface SetupProfileModalProps {
  open: boolean;
}

export function SetupProfileModal({ open }: SetupProfileModalProps) {
  const [displayName, setDisplayName] = useState("");
  const createProfile = useCreateProfile();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    try {
      await createProfile.mutateAsync({ displayName: displayName.trim() });
      toast.success("Profile created! Welcome to FriendsShare 🎉");
    } catch {
      toast.error("Failed to create profile");
    }
  }

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        data-ocid="setup_profile.dialog"
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Set Up Your Profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose a display name to get started with FriendsShare
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              autoFocus
              data-ocid="setup_profile.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!displayName.trim() || createProfile.isPending}
            data-ocid="setup_profile.submit_button"
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
