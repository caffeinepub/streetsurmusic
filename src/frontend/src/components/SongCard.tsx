import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  ListPlus,
  MoreVertical,
  Music,
  Pause,
  Pencil,
  Play,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Song } from "../backend";
import { useLocalProfileContext } from "../context/LocalProfileContext";
import type { SampleSong } from "../data/sampleSongs";
import { useFollowedArtists } from "../hooks/useFollowedArtists";

type RealSongCardProps = {
  song: Song;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  index?: number;
  isOwner?: boolean;
  onDelete?: (songId: bigint) => void;
  onEdit?: (song: Song) => void;
};

type SampleSongCardProps = {
  sampleSong: SampleSong;
  onPlay?: (song: SampleSong) => void;
  index?: number;
};

type SongCardProps = RealSongCardProps | SampleSongCardProps;

function isRealSong(props: SongCardProps): props is RealSongCardProps {
  return "song" in props;
}

function stopProp(e: React.SyntheticEvent) {
  e.stopPropagation();
}

export function SongCard(props: SongCardProps) {
  const { toggleFollow, isFollowing } = useFollowedArtists();
  const { profile, addSongToPlaylist, removeSongFromPlaylist } =
    useLocalProfileContext();

  if (isRealSong(props)) {
    const {
      song,
      isPlaying,
      onPlay,
      index = 0,
      isOwner,
      onDelete,
      onEdit,
    } = props;
    const following = isFollowing(song.artist);
    const hasCover = !!song.coverBlobReference;
    const songId = song.id.toString();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative bg-card rounded-lg p-4 cursor-pointer hover:bg-secondary transition-all duration-200"
        data-ocid={`song.item.${index + 1}`}
        onClick={() => onPlay(song)}
      >
        <div className="relative mb-3 aspect-square rounded-md overflow-hidden bg-muted">
          {hasCover ? (
            <img
              src={song.coverBlobReference!.getDirectURL()}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Music className="w-12 h-12 text-primary/60" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow">
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white translate-x-0.5" />
              )}
            </div>
          </div>

          {/* 3-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid="song.dropdown_menu"
                onClick={stopProp}
                onKeyDown={stopProp}
                className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card border-border min-w-[160px]"
              onClick={stopProp}
            >
              {/* Playlists */}
              {profile.playlists.length === 0 ? (
                <DropdownMenuItem
                  disabled
                  className="text-xs text-muted-foreground"
                >
                  <ListPlus className="w-3.5 h-3.5 mr-2" />
                  No playlists yet
                </DropdownMenuItem>
              ) : (
                profile.playlists.map((pl) => {
                  const isIn = pl.songs.includes(songId);
                  return (
                    <DropdownMenuItem
                      key={pl.id}
                      onClick={(e) => {
                        stopProp(e);
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
                        <Check className="w-3.5 h-3.5 text-primary ml-1" />
                      )}
                    </DropdownMenuItem>
                  );
                })
              )}

              {/* Owner actions */}
              {isOwner && (onEdit || onDelete) && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        stopProp(e);
                        onEdit(song);
                      }}
                      data-ocid="song.edit_button"
                      className="cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        stopProp(e);
                        onDelete(song.id);
                      }}
                      data-ocid="song.delete_button"
                      className="text-destructive cursor-pointer focus:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="font-semibold text-foreground truncate text-sm">
          {song.title}
        </p>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">
          {song.artist}
        </p>
        <button
          type="button"
          data-ocid={`song.toggle.${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFollow(song.artist);
          }}
          className={`mt-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
            following
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {following ? (
            <>
              <UserCheck className="w-3 h-3" /> Following
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" /> Follow
            </>
          )}
        </button>
      </motion.div>
    );
  }

  const { sampleSong, onPlay, index = 0 } = props;
  const hasAudio = !!sampleSong.audioUrl;
  const following = isFollowing(sampleSong.artist);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-card rounded-lg p-4 cursor-pointer hover:bg-secondary transition-all duration-200"
      data-ocid={`song.item.${index + 1}`}
      onClick={() => (onPlay ? onPlay(sampleSong) : undefined)}
    >
      <div className="relative mb-3 aspect-square rounded-md overflow-hidden bg-muted">
        <img
          src={sampleSong.cover}
          alt={sampleSong.title}
          className="w-full h-full object-cover"
        />
        {hasAudio && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow">
              <Play className="w-5 h-5 text-white translate-x-0.5" />
            </div>
          </div>
        )}
      </div>
      <p className="font-semibold text-foreground truncate text-sm">
        {sampleSong.title}
      </p>
      <p className="text-muted-foreground text-xs mt-0.5 truncate">
        {sampleSong.artist}
      </p>
      {sampleSong.duration && (
        <p className="text-muted-foreground text-xs mt-0.5 opacity-60">
          {sampleSong.duration}
        </p>
      )}
      <button
        type="button"
        data-ocid={`song.toggle.${index + 1}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow(sampleSong.artist);
        }}
        className={`mt-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
          following
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
        }`}
      >
        {following ? (
          <>
            <UserCheck className="w-3 h-3" /> Following
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3" /> Follow
          </>
        )}
      </button>
    </motion.div>
  );
}
