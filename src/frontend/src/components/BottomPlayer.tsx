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
  const volRangeRef = useRef<HTMLInputElement>(null);
  const timeDisplayRef = useRef<HTMLSpanElement>(null);
  // true while user is dragging — prevents timeupdate from moving slider
  const isDraggingRef = useRef(false);

  const [isAudioReady, setIsAudioReady] = useState(false);

  // Track audio ready state
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

  // DIRECT DOM approach: bypass React state entirely for slider sync.
  // Listen to timeupdate on the audio element directly and update DOM.
  // This eliminates any React re-render timing issues.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      // Do NOT update slider while user is dragging
      if (isDraggingRef.current) return;
      const dur = audio.duration;
      if (!dur || !Number.isFinite(dur) || dur <= 0) return;
      const pct = (audio.currentTime / dur) * 100;
      if (rangeRef.current) {
        rangeRef.current.value = String(pct);
        setRangeGradient(rangeRef.current, pct);
      }
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = formatTime(audio.currentTime);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [audioRef]);

  // Slider drag + seek logic using native DOM events only
  useEffect(() => {
    const el = rangeRef.current;
    const audio = audioRef.current;
    if (!el || !audio) return;

    const onInput = () => {
      // Mark as dragging to block timeupdate from overriding slider
      isDraggingRef.current = true;
      const val = Number(el.value);
      setRangeGradient(el, val);
      // Show live time during drag
      const dur = audio.duration;
      if (timeDisplayRef.current && dur && Number.isFinite(dur) && dur > 0) {
        timeDisplayRef.current.textContent = formatTime((val / 100) * dur);
      }
    };

    const onChange = () => {
      // This fires once on release with the final slider value
      const val = Number(el.value);
      const dur = audio.duration;
      if (dur && Number.isFinite(dur) && dur > 0) {
        audio.currentTime = (val / 100) * dur;
      }
      setRangeGradient(el, val);
      // Release drag lock only after seek is confirmed
      // (seeked event on audio will do this)
    };

    const onSeeked = () => {
      // Seek complete — release drag lock
      isDraggingRef.current = false;
    };

    el.addEventListener("input", onInput);
    el.addEventListener("change", onChange);
    audio.addEventListener("seeked", onSeeked);

    return () => {
      el.removeEventListener("input", onInput);
      el.removeEventListener("change", onChange);
      audio.removeEventListener("seeked", onSeeked);
    };
  }, [audioRef]);

  // Sync volume range gradient when volume changes
  useEffect(() => {
    if (volRangeRef.current) {
      setRangeGradient(volRangeRef.current, volume * 100);
    }
  }, [volume]);

  // Initialize volume gradient on mount
  useEffect(() => {
    if (volRangeRef.current) {
      setRangeGradient(volRangeRef.current, 80);
    }
  }, []);

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
        <input
          ref={volRangeRef}
          type="range"
          min={0}
          max={100}
          step={1}
          defaultValue={80}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="w-full cursor-pointer flex-1"
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
    </footer>
  );
}
