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
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Song } from "../backend";
import { SongCard } from "../components/SongCard";
import { useNavigation } from "../context/NavigationContext";
import { usePlayer } from "../context/PlayerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOwner } from "../hooks/useOwner";
import {
  useDeleteSong,
  useSearchSongs,
  useUpdateSong,
} from "../hooks/useQueries";

export function SearchResults() {
  const { searchQuery } = useNavigation();
  const { data: songs = [], isLoading } = useSearchSongs(searchQuery);
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { identity } = useInternetIdentity();
  const { isOwner } = useOwner(identity?.getPrincipal().toString());
  const { mutateAsync: deleteSong } = useDeleteSong();
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateSong();

  const [editSong, setEditSong] = useState<Song | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");

  const openEdit = (song: Song) => {
    setEditSong(song);
    setEditTitle(song.title);
    setEditArtist(song.artist);
  };

  const handleSaveEdit = async () => {
    if (!editSong) return;
    try {
      await updateSong({
        songId: editSong.id,
        title: editTitle,
        artist: editArtist,
      });
      toast.success("Song updated");
      setEditSong(null);
    } catch {
      toast.error("Failed to update song");
    }
  };

  const handleDelete = async (songId: bigint) => {
    try {
      await deleteSong(songId);
      toast.success("Song deleted");
    } catch {
      toast.error("Failed to delete song");
    }
  };

  return (
    <div data-ocid="search.section">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">
          Search results for{" "}
          <span className="text-primary">&ldquo;{searchQuery}&rdquo;</span>
        </h2>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          data-ocid="search.loading_state"
        >
          {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
            <div key={key} className="bg-card rounded-lg p-4 animate-pulse">
              <div className="aspect-square rounded-md bg-muted mb-3" />
              <div className="h-3 bg-muted rounded mb-2 w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="search.empty_state"
        >
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">
            No results found for &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song: Song, i: number) => (
            <SongCard
              key={song.id.toString()}
              song={song}
              isPlaying={isPlaying && currentSong?.id === song.id}
              onPlay={playSong}
              index={i}
              isOwner={isOwner}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {/* Edit Song Dialog */}
      <Dialog
        open={!!editSong}
        onOpenChange={(open) => !open && setEditSong(null)}
      >
        <DialogContent
          className="bg-card border-border max-w-sm"
          data-ocid="song.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title-sr">Song Title</Label>
              <Input
                id="edit-title-sr"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border-border"
                data-ocid="song.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-artist-sr">Artist Name</Label>
              <Input
                id="edit-artist-sr"
                value={editArtist}
                onChange={(e) => setEditArtist(e.target.value)}
                className="bg-background border-border"
                data-ocid="song.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditSong(null)}
              data-ocid="song.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="bg-primary hover:bg-primary/90"
              data-ocid="song.save_button"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
