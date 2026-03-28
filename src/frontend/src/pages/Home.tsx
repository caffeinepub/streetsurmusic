import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  ListPlus,
  Loader2,
  MoreVertical,
  Play,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Song } from "../backend";
import { SongCard } from "../components/SongCard";
import { useLocalProfileContext } from "../context/LocalProfileContext";
import { usePlayer } from "../context/PlayerContext";
import { SAMPLE_SONGS } from "../data/sampleSongs";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOwner } from "../hooks/useOwner";
import {
  useDeleteSong,
  useGetAllSongs,
  useUpdateSong,
} from "../hooks/useQueries";

function SongRowMenu({
  song,
  isOwner,
  onDelete,
}: {
  song: Song;
  isOwner: boolean;
  onDelete: (id: bigint) => void;
}) {
  const { profile, addSongToPlaylist, removeSongFromPlaylist } =
    useLocalProfileContext();
  const songId = song.id.toString();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
          data-ocid="home.open_modal_button"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card border-border w-48"
        onClick={(e) => e.stopPropagation()}
        data-ocid="home.dropdown_menu"
      >
        {/* Add to playlist submenu */}
        {profile.playlists.length === 0 ? (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            <ListPlus className="w-3.5 h-3.5 mr-2" />
            No playlists — create in Profile
          </DropdownMenuItem>
        ) : (
          profile.playlists.map((pl) => {
            const isIn = pl.songs.includes(songId);
            return (
              <DropdownMenuItem
                key={pl.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isIn) {
                    removeSongFromPlaylist(pl.id, songId);
                    toast.success(`Removed from ${pl.name}`);
                  } else {
                    addSongToPlaylist(pl.id, songId);
                    toast.success(`Added to ${pl.name}`);
                  }
                }}
                className="cursor-pointer text-sm"
              >
                <ListPlus className="w-3.5 h-3.5 mr-2" />
                <span className="flex-1 truncate">{pl.name}</span>
                {isIn && (
                  <Check className="w-3.5 h-3.5 text-primary ml-1 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })
        )}

        {/* Delete — owner only */}
        {isOwner && (
          <>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(song.id);
              }}
              data-ocid="home.delete_button"
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete Song
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Home() {
  const { data: songs = [], isLoading } = useGetAllSongs();
  const { playSongFromList, playStaticSongFromList, currentSong, isPlaying } =
    usePlayer();
  const { identity } = useInternetIdentity();
  const { isOwner } = useOwner(identity?.getPrincipal().toString());
  const { mutateAsync: deleteSong } = useDeleteSong();
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateSong();

  const hasRealSongs = songs.length > 0;
  const featuredSongs = hasRealSongs ? (songs as Song[]).slice(0, 5) : [];
  const recentSongs = hasRealSongs ? (songs as Song[]).slice(0, 6) : [];
  const sampleFeatured = SAMPLE_SONGS.slice(0, 5);
  const sampleRecent = SAMPLE_SONGS;

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
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden h-52 md:h-72"
      >
        <img
          src="/assets/generated/hero-banner.dim_1200x400.jpg"
          alt="streetsurmusic"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-black/70 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">
            India Ka Music
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-none tracking-tight">
            <span className="font-display text-primary">streetsur</span>
            <span className="font-display text-foreground">music</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-sm">
            Discover and experience the finest music. Stream, explore, and vibe.
          </p>
        </div>
      </motion.div>

      {/* Featured */}
      <section data-ocid="home.section">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold tracking-tight">
            Featured Tracks
          </h2>
        </div>
        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="home.loading_state"
          >
            {Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((key) => (
              <div key={key} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="aspect-square rounded-md bg-muted mb-3" />
                <div className="h-3 bg-muted rounded mb-2 w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : hasRealSongs ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredSongs.map((song: Song, i: number) => (
              <SongCard
                key={song.id.toString()}
                song={song}
                isPlaying={isPlaying && currentSong?.id === song.id}
                onPlay={() => playSongFromList(featuredSongs, i)}
                index={i}
                isOwner={isOwner}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sampleFeatured.map((s, i) => (
              <SongCard
                key={s.id}
                sampleSong={s}
                onPlay={() => playStaticSongFromList(sampleFeatured, i)}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent */}
      <section data-ocid="home.recent.section">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold tracking-tight">
            Recently Added
          </h2>
        </div>
        <div className="space-y-2">
          {hasRealSongs
            ? recentSongs.map((song: Song, i: number) => (
                <motion.div
                  key={song.id.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => playSongFromList(recentSongs, i)}
                  data-ocid={`home.recent.item.${i + 1}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary cursor-pointer transition-colors group border border-transparent hover:border-primary/10"
                >
                  <span className="text-muted-foreground text-sm w-5 text-center group-hover:hidden">
                    {i + 1}
                  </span>
                  <Play className="w-4 h-4 text-primary hidden group-hover:block flex-shrink-0" />
                  <div className="w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-primary/30 to-accent/20 flex-shrink-0 flex items-center justify-center">
                    {song.coverBlobReference ? (
                      <img
                        src={song.coverBlobReference.getDirectURL()}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      Number(song.uploadedAt / BigInt(1e6)),
                    ).toLocaleDateString()}
                  </p>
                  <SongRowMenu
                    song={song}
                    isOwner={isOwner}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))
            : sampleRecent.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => playStaticSongFromList(sampleRecent, i)}
                  data-ocid={`home.recent.item.${i + 1}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary cursor-pointer transition-colors group border border-transparent hover:border-primary/10"
                >
                  <span className="text-muted-foreground text-sm w-5 text-center group-hover:hidden">
                    {i + 1}
                  </span>
                  <Play className="w-4 h-4 text-primary hidden group-hover:block flex-shrink-0" />
                  <img
                    src={s.cover}
                    alt={s.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.artist}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.duration}</p>
                </motion.div>
              ))}
        </div>
      </section>

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
              <Label htmlFor="edit-title-h">Song Title</Label>
              <Input
                id="edit-title-h"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border-border"
                data-ocid="song.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-artist-h">Artist Name</Label>
              <Input
                id="edit-artist-h"
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
