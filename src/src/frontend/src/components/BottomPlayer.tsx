import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Music,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";

function formatTime(s: number): string {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function BottomPlayer() {
  const {
    currentSong,
    currentStaticSong,
    isPlaying,
    togglePlay,
    progress,
    duration,
    volume,
    setVolume,
    seek,
    skipNext,
    skipPrev,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    songQueue,
  } = usePlayer();

  const dragValueRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeSong = currentSong
    ? { title: currentSong.title, artist: currentSong.artist }
    : currentStaticSong
      ? { title: currentStaticSong.title, artist: currentStaticSong.artist }
      : null;

  const progressPct = duration ? (progress / duration) * 100 : 0;
  const displayPct = isDragging
    ? (dragValueRef.current ?? progressPct)
    : progressPct;

  const hasQueue = songQueue.length > 1;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-[oklch(0.11_0_0)] border-t border-border flex items-center px-4 gap-4">
      <AnimatePresence>
        {activeSong ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 w-44 md:w-56 flex-shrink-0"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
              {currentSong?.coverPhotoUrl ? (
                <img
                  src={currentSong.coverPhotoUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <Music className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {activeSong.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activeSong.artist}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-3 w-44 md:w-56 flex-shrink-0">
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Select a song to play
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleShuffle}
            disabled={!hasQueue}
            className={`transition-colors ${
              shuffle
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-30`}
            title="Shuffle"
            data-ocid="player.toggle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={skipPrev}
            disabled={!hasQueue}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            title="Previous"
            data-ocid="player.secondary_button"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            disabled={!activeSong}
            data-ocid="player.primary_button"
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 text-white disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 translate-x-0.5" />
            )}
          </Button>
          <button
            type="button"
            onClick={skipNext}
            disabled={!hasQueue}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            title="Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleRepeat}
            disabled={!activeSong}
            className={`transition-colors ${
              repeat
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-30`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full max-w-md flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8 text-right">
            {formatTime(
              isDragging && dragValueRef.current !== null
                ? (dragValueRef.current / 100) * duration
                : progress,
            )}
          </span>
          <Slider
            data-ocid="player.editor"
            value={[displayPct]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={([v]) => {
              dragValueRef.current = v;
              setIsDragging(true);
            }}
            onValueCommit={([v]) => {
              seek(v / 100);
              setIsDragging(false);
              dragValueRef.current = null;
            }}
            disabled={!activeSong}
            className="flex-1 [&_.bg-primary]:bg-primary"
          />
          <span className="text-xs text-muted-foreground w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="hidden md:flex items-center gap-2 w-32 flex-shrink-0">
        <button
          type="button"
          onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => setVolume(v / 100)}
          className="flex-1"
        />
      </div>
    </footer>
  );
}
