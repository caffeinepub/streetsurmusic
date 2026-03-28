import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ListPlus } from "lucide-react";
import { useState } from "react";
import { useLocalProfileContext } from "../context/LocalProfileContext";

interface AddToPlaylistButtonProps {
  songId: string;
  className?: string;
}

export function AddToPlaylistButton({
  songId,
  className,
}: AddToPlaylistButtonProps) {
  const { profile, addSongToPlaylist, removeSongFromPlaylist } =
    useLocalProfileContext();
  const [open, setOpen] = useState(false);

  const handleToggle = (playlistId: string, isInPlaylist: boolean) => {
    if (isInPlaylist) {
      removeSongFromPlaylist(playlistId, songId);
    } else {
      addSongToPlaylist(playlistId, songId);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={`w-8 h-8 text-muted-foreground hover:text-primary transition-all ${className ?? ""}`}
          data-ocid="home.open_modal_button"
          onClick={(e) => e.stopPropagation()}
        >
          <ListPlus className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-2 bg-card border-border"
        align="end"
        onClick={(e) => e.stopPropagation()}
        data-ocid="home.popover"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Add to Playlist
        </p>
        {profile.playlists.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3 text-center leading-relaxed">
            No playlists yet.{" "}
            <span className="text-primary">Create one in Profile.</span>
          </p>
        ) : (
          <div className="space-y-0.5">
            {profile.playlists.map((pl) => {
              const isInPlaylist = pl.songs.includes(songId);
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => handleToggle(pl.id, isInPlaylist)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm hover:bg-primary/10 hover:text-primary transition-colors text-left"
                >
                  <span className="truncate">{pl.name}</span>
                  {isInPlaylist && (
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
