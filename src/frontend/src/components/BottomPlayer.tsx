import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
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
import { useEffect, useRef, useState } from "react";
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
    isLoadingAudio,
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
  const dragValueRef = useRef(0); // tracks the latest drag position
  // Keep a stable ref to audioRef so native listeners always see the latest audio element
  const audioRefStable = useRef(audioRef);
  useEffect(() => {
    audioRefStable.current = audioRef;
  });

  // Track whether the audio element is ready to accept seek operations
  const [isAudioReady, setIsAudioReady] = useState(false);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onCanPlay = () => setIsAudioReady(true);
    const onLoadStart = () => setIsAudioReady(false);
    const onEmptied = () => setIsAudioReady(false);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadstart", onLoadStart);
    audio.addEventListener("emptied", onEmptied);
    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadstart", onLoadStart);
      audio.removeEventListener("emptied", onEmptied);
    };
  }, [audioRef]);

  // Native DOM event listeners for the seek slider
  useEffect(() => {
    const el = rangeRef.current;
    if (!el) return;

    const onPointerDown = () => {
      isDraggingRef.current = true;
      // Capture current slider value as starting drag value
      dragValueRef.current = Number(el.value);
    };

    // Update visual feedback while dragging — also store drag value in ref
    const onInput = (e: Event) => {
      const val = Number((e.target as HTMLInputElement).value);
      // Always store the latest drag position in ref
      dragValueRef.current = val;
      setRangeGradient(el, val);
      const audio = audioRefStable.current.current;
      if (timeDisplayRef.current && audio) {
        const dur = audio.duration;
        if (dur && Number.isFinite(dur) && dur > 0) {
          timeDisplayRef.current.textContent = formatTime((val / 100) * dur);
        }
      }
    };

    // Perform the actual seek on pointer release.
    // CRITICAL: We use dragValueRef.current (stored during input events) instead of
    // e.target.value, because between pointerup and this handler firing, React may
    // re-render and overwrite the DOM input value via the sync effect below —
    // causing e.target.value (or el.value) to be 0 instead of the drag position.
    const onPointerUp = () => {
      if (!isDraggingRef.current) return;
      const val = dragValueRef.current;
      const audio = audioRefStable.current.current;
      if (audio) {
        const dur = audio.duration;
        if (dur && Number.isFinite(dur) && dur > 0) {
          audio.currentTime = (val / 100) * dur;
        }
      }
      setRangeGradient(el, val);
      if (timeDisplayRef.current) {
        const audio2 = audioRefStable.current.current;
        const dur2 = audio2?.duration || 0;
        timeDisplayRef.current.textContent = formatTime((val / 100) * dur2);
      }
      // IMPORTANT: set isDragging to false AFTER the seek so the sync effect
      // doesn't overwrite the slider position before our seek commits.
      isDraggingRef.current = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("input", onInput);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("input", onInput);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

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

  // Seek bar should only be interactive when audio is truly ready
  const seekDisabled = !activeSong || isLoadingAudio || !isAudioReady;

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
            <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 relative">
              {isLoadingAudio ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
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
            disabled={!activeSong || isLoadingAudio}
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 text-white disabled:opacity-40"
          >
            {isLoadingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
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
          <div className="flex-1 relative flex items-center">
            {activeSong && !isLoadingAudio && !isAudioReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
              </div>
            )}
            <input
              ref={rangeRef}
              type="range"
              min={0}
              max={100}
              step={0.1}
              defaultValue={0}
              disabled={seekDisabled}
              className="w-full cursor-pointer disabled:opacity-40"
              style={{
                height: "6px",
                borderRadius: "9999px",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                background: "oklch(0.3 0 0)",
              }}
            />
          </div>
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
