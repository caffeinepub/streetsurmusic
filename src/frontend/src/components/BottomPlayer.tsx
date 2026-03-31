import { Button } from "@/components/ui/button";
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

function gradientStyle(pct: number) {
  return `linear-gradient(to right, rgb(220 38 38) ${pct}%, oklch(0.3 0 0) ${pct}%)`;
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
    duration,
    volume,
    setVolume,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    audioRef,
  } = usePlayer();

  const [isAudioReady, setIsAudioReady] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const [volSliderValue, setVolSliderValue] = useState(80);

  // Refs for the seek input — we control it as uncontrolled DOM element
  const seekInputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const wasPlayingRef = useRef(false);

  // Track audio ready state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onCanPlay = () => setIsAudioReady(true);
    const onLoadStart = () => {
      setIsAudioReady(false);
      setDisplayTime(0);
      // Reset seek input visually
      if (seekInputRef.current) {
        seekInputRef.current.value = "0";
        seekInputRef.current.style.background = gradientStyle(0);
      }
    };
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("loadstart", onLoadStart);
    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("loadstart", onLoadStart);
    };
  }, [audioRef]);

  // Sync seek input visually with audio playback (DOM-driven, no React state for slider)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      if (isDraggingRef.current) return;
      const dur = audio.duration;
      if (!dur || !Number.isFinite(dur) || dur <= 0) return;
      const pct = (audio.currentTime / dur) * 100;
      setDisplayTime(audio.currentTime);
      if (seekInputRef.current) {
        seekInputRef.current.value = String(pct);
        seekInputRef.current.style.background = gradientStyle(pct);
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [audioRef]);

  // Native DOM event listeners for seek — completely bypasses React synthetic events
  useEffect(() => {
    const input = seekInputRef.current;
    if (!input) return;

    const onMouseDown = () => {
      isDraggingRef.current = true;
      wasPlayingRef.current = !audioRef.current?.paused;
      audioRef.current?.pause();
    };
    const onTouchStart = () => {
      isDraggingRef.current = true;
      wasPlayingRef.current = !audioRef.current?.paused;
      audioRef.current?.pause();
    };

    // Update visual gradient while dragging (no React state, pure DOM)
    const onInput = () => {
      const pct = Number(input.value);
      input.style.background = gradientStyle(pct);
    };

    // CRITICAL: listen on window so we catch mouseup even when dragged outside the slider
    const doSeek = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const audio = audioRef.current;
      if (!audio) return;
      const dur = audio.duration;
      if (!dur || !Number.isFinite(dur) || dur <= 0) return;
      const pct = Number(input.value);
      const newTime = (pct / 100) * dur;
      audio.currentTime = newTime;
      setDisplayTime(newTime);
      if (wasPlayingRef.current) {
        audio.play().catch(() => {});
      }
    };

    input.addEventListener("mousedown", onMouseDown);
    input.addEventListener("touchstart", onTouchStart, { passive: true });
    input.addEventListener("input", onInput);
    // Attach mouseup/touchend to window — catches release outside the slider
    window.addEventListener("mouseup", doSeek);
    window.addEventListener("touchend", doSeek);

    return () => {
      input.removeEventListener("mousedown", onMouseDown);
      input.removeEventListener("touchstart", onTouchStart);
      input.removeEventListener("input", onInput);
      window.removeEventListener("mouseup", doSeek);
      window.removeEventListener("touchend", doSeek);
    };
  }, [audioRef]);

  // Volume slider
  const handleVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolSliderValue(val);
    setVolume(val / 100);
  };

  const activeSong = currentSong
    ? { title: currentSong.title, artist: currentSong.artist }
    : currentStaticSong
      ? { title: currentStaticSong.title, artist: currentStaticSong.artist }
      : null;

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
            <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
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
            className={`w-8 h-8 rounded-full ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
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
            className={`w-8 h-8 rounded-full ${repeat ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-full max-w-md flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8 text-right">
            {formatTime(displayTime)}
          </span>
          <div className="flex-1 relative flex items-center">
            {activeSong && isLoadingAudio && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
              </div>
            )}
            {/* Uncontrolled input — React does NOT manage value, DOM does */}
            <input
              ref={seekInputRef}
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
                background: gradientStyle(0),
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
          onClick={() => {
            setVolume(volume > 0 ? 0 : 0.8);
            setVolSliderValue(volume > 0 ? 0 : 80);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volSliderValue}
          onChange={handleVolChange}
          className="w-full cursor-pointer flex-1"
          style={{
            height: "6px",
            borderRadius: "9999px",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            background: gradientStyle(volSliderValue),
          }}
        />
      </div>
    </footer>
  );
}
