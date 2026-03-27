import { Music, Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import type { Song } from "../backend";
import { usePlayer } from "../context/PlayerContext";
import type { SampleSong } from "../data/sampleSongs";

type RealSongCardProps = {
  song: Song;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  index?: number;
};

type SampleSongCardProps = {
  sampleSong: SampleSong;
  index?: number;
};

type SongCardProps = RealSongCardProps | SampleSongCardProps;

function isRealSong(props: SongCardProps): props is RealSongCardProps {
  return "song" in props;
}

export function SongCard(props: SongCardProps) {
  const { playStaticSong } = usePlayer();

  if (isRealSong(props)) {
    const { song, isPlaying, onPlay, index = 0 } = props;
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Music className="w-12 h-12 text-primary/60" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow">
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white translate-x-0.5" />
              )}
            </div>
          </div>
        </div>
        <p className="font-semibold text-foreground truncate text-sm">
          {song.title}
        </p>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">
          {song.artist}
        </p>
      </motion.div>
    );
  }

  const { sampleSong, index = 0 } = props;
  const hasAudio = !!sampleSong.audioUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-card rounded-lg p-4 cursor-pointer hover:bg-secondary transition-all duration-200"
      data-ocid={`song.item.${index + 1}`}
      onClick={() => hasAudio && playStaticSong(sampleSong)}
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
    </motion.div>
  );
}
