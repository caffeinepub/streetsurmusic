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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Compass, Filter, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Song } from "../backend";
import { SongCard } from "../components/SongCard";
import { usePlayer } from "../context/PlayerContext";
import { SAMPLE_SONGS } from "../data/sampleSongs";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOwner } from "../hooks/useOwner";
import {
  getSongGenre,
  useDeleteSong,
  useGetAllSongs,
  useUpdateSong,
} from "../hooks/useQueries";

export const GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Electronic",
  "Jazz & Blues",
  "Classical",
  "Bollywood",
  "Folk & Country",
  "Reggae & Latin",
  "Indie",
  "Other",
];
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

export function Explore() {
  const { data: songs = [], isLoading } = useGetAllSongs();
  const { playSongFromList, playStaticSongFromList, currentSong, isPlaying } =
    usePlayer();
  const { identity } = useInternetIdentity();
  const { isOwner } = useOwner(identity?.getPrincipal().toString());
  const { mutateAsync: deleteSong } = useDeleteSong();
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateSong();
  const hasRealSongs = songs.length > 0;

  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

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

  const filteredSamples = SAMPLE_SONGS.filter((s) => {
    const genreMatch = selectedGenre === "all" || s.genre === selectedGenre;
    const yearMatch = selectedYear === "all" || s.year === Number(selectedYear);
    return genreMatch && yearMatch;
  });

  const filteredReal = (songs as Song[]).filter((song) => {
    const songGenre = getSongGenre(song.id);
    const genreMatch =
      selectedGenre === "all" ||
      songGenre.toLowerCase() === selectedGenre.toLowerCase();
    if (!genreMatch) return false;
    if (selectedYear === "all") return true;
    const year = new Date(Number(song.uploadedAt / BigInt(1e6))).getFullYear();
    return year === Number(selectedYear);
  });

  const displaySongs = hasRealSongs ? filteredReal : filteredSamples;
  const totalCount = hasRealSongs ? songs.length : SAMPLE_SONGS.length;

  return (
    <div data-ocid="explore.section">
      <div className="flex items-center gap-2 mb-5">
        <Compass className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-bold tracking-tight">
          Explore All Music
        </h2>
        <span className="text-muted-foreground text-sm ml-auto">
          {displaySongs.length} / {totalCount} tracks
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger
            className="w-[160px] h-8 text-sm bg-background border-border"
            data-ocid="explore.select"
          >
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Genres</SelectItem>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger
            className="w-[130px] h-8 text-sm bg-background border-border"
            data-ocid="explore.select"
          >
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Years</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(selectedGenre !== "all" || selectedYear !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSelectedGenre("all");
              setSelectedYear("all");
            }}
            className="text-xs text-primary hover:underline ml-auto"
            data-ocid="explore.toggle"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          data-ocid="explore.loading_state"
        >
          {Array.from({ length: 12 }, (_, i) => `sk-${i}`).map((key) => (
            <div key={key} className="bg-card rounded-lg p-4 animate-pulse">
              <div className="aspect-square rounded-md bg-muted mb-3" />
              <div className="h-3 bg-muted rounded mb-2 w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displaySongs.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="explore.empty_state"
        >
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No songs match your filters</p>
          <p className="text-sm mt-1">
            Try changing the genre or year selection
          </p>
        </div>
      ) : hasRealSongs ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredReal.map((song, i) => (
            <SongCard
              key={song.id.toString()}
              song={song}
              isPlaying={isPlaying && currentSong?.id === song.id}
              onPlay={() => playSongFromList(filteredReal, i)}
              index={i}
              isOwner={isOwner}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredSamples.map((s, i) => (
            <SongCard
              key={s.id}
              sampleSong={s}
              onPlay={() => playStaticSongFromList(filteredSamples, i)}
              index={i}
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
              <Label htmlFor="edit-title-ex">Song Title</Label>
              <Input
                id="edit-title-ex"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border-border"
                data-ocid="song.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-artist-ex">Artist Name</Label>
              <Input
                id="edit-artist-ex"
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
