import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useSaveCallerProfile,
} from "../../hooks/useQueries";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: profile } = useGetCallerProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerProfile();
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await saveProfile({ name: name.trim() });
      toast.success("Profile saved!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="settings.dialog"
        className="bg-popover border-border"
      >
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        {isLoggedIn ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display Name</Label>
              <Input
                id="profile-name"
                data-ocid="settings.name.input"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-border focus:border-primary/50"
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">
            Login to edit your profile settings.
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-ocid="settings.cancel_button"
          >
            Cancel
          </Button>
          {isLoggedIn && (
            <Button
              onClick={handleSave}
              disabled={isPending}
              data-ocid="settings.save_button"
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
