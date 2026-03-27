import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Music, Shield } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="about.dialog"
        className="bg-popover border-border max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            About streetsurmusic
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">streetsurmusic</strong> is a
            decentralized music streaming platform built on the Internet
            Computer. It empowers independent artists to share their music
            directly with listeners — no intermediaries, no gatekeepers.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
              <Music className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">For Artists</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Upload your tracks, build your audience, and retain full
                  ownership of your music.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
              <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">For Listeners</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Discover fresh music from underground artists. Stream
                  high-quality audio for free.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Decentralized</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Built on the Internet Computer Protocol — your data and music
                  are stored on-chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
