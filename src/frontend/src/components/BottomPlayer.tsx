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
import { useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";

function formatTime(s: number): string {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function setRangeGradient(el: HTMLInputElement, pct: number) {
  el.style.background = `linear-gradient(to right, rgb(220 38 38) ${pct}%, oklch(0.3 0 0) ${pct}%)`;
}

export function BottomPlayer() {
  const {
    currentSong,
    currentStaticSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    hasNext,
    hasPrev,
    progress,
    duration,
    volume,
    setVolume,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    audioRef,
  } = usePlayer();

  const rangeRef = useRef<HTMLInputElement>(null);
  const timeDisplayRef = useRef<HTMLSpanElement>(null);
  const isDraggingRef = useRef(false);

  // Sync slider + time display from playback — only when NOT dragging
  useEffect(() => {
    if (isDraggingRef.current) return;
    const pct = duration > 0 ? (progress / duration) * 100 : 0;
    if (rangeRef.current) {
      rangeRef.current.value = String(pct);
      setRangeGradient(rangeRef.current, pct);
    }
    if (timeDisplayRef.current) {
      timeDisplayRef.current.textContent = formatTime(progress);
    }
  }, [progress, duration]);

  const activeSong = currentSong
    ? { title: currentSong.title, artist: currentSong.artist }
    : currentStaticSong
      ? { title: currentStaticSong.title, artist: currentStaticSong.artist }
      : null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-[oklch(0.11_0_0)] border-t border-border flex items-center px-4 gap-4">
      <AnimatePresence>
        {activeSong ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 w-48 md:w-64 flex-shrink-0"
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-primary" />
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
          <div className="flex items-center gap-3 w-48 md:w-64 flex-shrink-0">
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
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleShuffle}
            className={`w-8 h-8 rounded-full ${
              shuffle
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={prevSong}
            disabled={!activeSong || !hasPrev}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            disabled={!activeSong}
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 text-white disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 translate-x-0.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={nextSong}
            disabled={!activeSong || !hasNext}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleRepeat}
            className={`w-8 h-8 rounded-full ${
              repeat
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-full max-w-md flex items-center gap-2">
          <span
            ref={timeDisplayRef}
            className="text-xs text-muted-foreground w-8 text-right"
          >
            0:00
          </span>
          <input
            ref={rangeRef}
            type="range"
            min={0}
            max={100}
            step={0.1}
            defaultValue={0}
            disabled={!activeSong}
            onPointerDown={() => {
              isDraggingRef.current = true;
            }}
            onInput={(e) => {
              // Update gradient + time display while dragging — pure DOM, no React state
              const val = Number((e.target as HTMLInputElement).value);
              setRangeGradient(e.target as HTMLInputElement, val);
              if (timeDisplayRef.current && audioRef.current) {
                const dur = audioRef.current.duration || duration;
                timeDisplayRef.current.textContent = formatTime(
                  (val / 100) * dur,
                );
              }
            }}
            onPointerUp={(e) => {
              isDraggingRef.current = false;
              const val = Number(e.currentTarget.value);
              const audio = audioRef.current;
              if (!audio) return;
              const dur = audio.duration;
              if (!dur || !Number.isFinite(dur) || dur <= 0) return;
              // Set seek position directly — no React state involved
              audio.currentTime = (val / 100) * dur;
            }}
            className="flex-1 cursor-pointer disabled:opacity-40"
            style={{
              height: "6px",
              borderRadius: "9999px",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              background: "oklch(0.3 0 0)",
            }}
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
