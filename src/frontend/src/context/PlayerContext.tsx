import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Song } from "../backend";
import type { SampleSong } from "../data/sampleSongs";

interface StaticSong {
  title: string;
  artist: string;
  url: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  currentStaticSong: StaticSong | null;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  playSong: (song: Song) => void;
  playSongFromList: (songs: Song[], index: number) => void;
  playStaticSong: (song: SampleSong) => void;
  playStaticSongFromList: (songs: SampleSong[], index: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  progress: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  seek: (pct: number) => void;
  shuffle: boolean;
  repeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentStaticSong, setCurrentStaticSong] = useState<StaticSong | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const isSeekingRef = useRef(false);

  // Refs to avoid stale closure issues in the audio loading effect
  const isPlayingRef = useRef(false);
  const currentBlobUrlRef = useRef<string | null>(null);
  // Track which song is currently loaded to avoid re-fetching on isPlaying change
  const loadedSongKeyRef = useRef<string | null>(null);

  // Queue state
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [songQueueIndex, setSongQueueIndex] = useState(-1);
  const [staticQueue, setStaticQueue] = useState<SampleSong[]>([]);
  const [staticQueueIndex, setStaticQueueIndex] = useState(-1);

  const hasNext = shuffle
    ? songQueue.length > 1 || staticQueue.length > 1
    : (songQueue.length > 0 && songQueueIndex < songQueue.length - 1) ||
      (staticQueue.length > 0 && staticQueueIndex < staticQueue.length - 1);

  const hasPrev =
    (songQueue.length > 0 && songQueueIndex > 0) ||
    (staticQueue.length > 0 && staticQueueIndex > 0);

  const toggleShuffle = useCallback(() => setShuffle((p) => !p), []);
  const toggleRepeat = useCallback(() => setRepeat((p) => !p), []);

  const playSong = useCallback((song: Song) => {
    setStaticQueue([]);
    setStaticQueueIndex(-1);
    setSongQueue([song]);
    setSongQueueIndex(0);
    setCurrentStaticSong(null);
    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  const playSongFromList = useCallback((songs: Song[], index: number) => {
    setStaticQueue([]);
    setStaticQueueIndex(-1);
    setSongQueue(songs);
    setSongQueueIndex(index);
    setCurrentStaticSong(null);
    setCurrentSong(songs[index]);
    setIsPlaying(true);
  }, []);

  const playStaticSong = useCallback((song: SampleSong) => {
    if (!song.audioUrl) return;
    setSongQueue([]);
    setSongQueueIndex(-1);
    setStaticQueue([song]);
    setStaticQueueIndex(0);
    setCurrentSong(null);
    setCurrentStaticSong({
      title: song.title,
      artist: song.artist,
      url: song.audioUrl,
    });
    setIsPlaying(true);
  }, []);

  const playStaticSongFromList = useCallback(
    (songs: SampleSong[], index: number) => {
      setSongQueue([]);
      setSongQueueIndex(-1);
      setStaticQueue(songs);
      setStaticQueueIndex(index);
      setCurrentSong(null);
      const s = songs[index];
      if (s.audioUrl) {
        setCurrentStaticSong({
          title: s.title,
          artist: s.artist,
          url: s.audioUrl,
        });
      }
      setIsPlaying(true);
    },
    [],
  );

  const nextSong = useCallback(() => {
    if (songQueue.length > 0) {
      let newIndex: number;
      if (shuffle && songQueue.length > 1) {
        do {
          newIndex = Math.floor(Math.random() * songQueue.length);
        } while (newIndex === songQueueIndex);
      } else {
        if (songQueueIndex >= songQueue.length - 1) return;
        newIndex = songQueueIndex + 1;
      }
      setSongQueueIndex(newIndex);
      setCurrentSong(songQueue[newIndex]);
      setIsPlaying(true);
    } else if (staticQueue.length > 0) {
      let newIndex: number;
      if (shuffle && staticQueue.length > 1) {
        do {
          newIndex = Math.floor(Math.random() * staticQueue.length);
        } while (newIndex === staticQueueIndex);
      } else {
        if (staticQueueIndex >= staticQueue.length - 1) return;
        newIndex = staticQueueIndex + 1;
      }
      setStaticQueueIndex(newIndex);
      const s = staticQueue[newIndex];
      if (s.audioUrl) {
        setCurrentStaticSong({
          title: s.title,
          artist: s.artist,
          url: s.audioUrl,
        });
      }
      setIsPlaying(true);
    }
  }, [songQueue, songQueueIndex, staticQueue, staticQueueIndex, shuffle]);

  const prevSong = useCallback(() => {
    if (songQueue.length > 0 && songQueueIndex > 0) {
      const newIndex = songQueueIndex - 1;
      setSongQueueIndex(newIndex);
      setCurrentSong(songQueue[newIndex]);
      setIsPlaying(true);
    } else if (staticQueue.length > 0 && staticQueueIndex > 0) {
      const newIndex = staticQueueIndex - 1;
      setStaticQueueIndex(newIndex);
      const s = staticQueue[newIndex];
      if (s.audioUrl) {
        setCurrentStaticSong({
          title: s.title,
          artist: s.artist,
          url: s.audioUrl,
        });
      }
      setIsPlaying(true);
    } else {
      // Restart current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [songQueue, songQueueIndex, staticQueue, staticQueueIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const dur = audio.duration;
    if (!dur || !Number.isFinite(dur) || dur <= 0) return;
    const newTime = pct * dur;
    // Pause -> seek -> play pattern for reliable seeking across all browsers
    isSeekingRef.current = true;
    const wasPlaying = !audio.paused;
    if (wasPlaying) audio.pause();
    audio.currentTime = newTime;
    if (wasPlaying) {
      audio.play().catch(() => {
        isSeekingRef.current = false;
      });
    }
  }, []);

  // Keep isPlayingRef in sync so async load callbacks can check it
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Main audio loading effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Compute a key for the current song to detect song changes vs isPlaying changes
    let songKey: string | null = null;
    if (currentStaticSong) {
      songKey = `static:${currentStaticSong.url}`;
    } else if (currentSong) {
      songKey = `backend:${String(currentSong.id)}`;
    }

    const songChanged = loadedSongKeyRef.current !== songKey;

    if (!songChanged) {
      // Only isPlaying changed — just play or pause
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      } else {
        audio.pause();
      }
      return;
    }

    // Song changed — need to load new audio
    let cancelled = false;
    loadedSongKeyRef.current = null; // mark as loading

    const prevBlobUrl = currentBlobUrlRef.current;
    currentBlobUrlRef.current = null;

    const loadSong = async () => {
      if (currentStaticSong) {
        // Static songs: direct URL (should support range requests)
        audio.src = currentStaticSong.url;
        audio.load();
        if (!cancelled) {
          loadedSongKeyRef.current = songKey;
          setIsLoadingAudio(false);
          if (isPlayingRef.current) {
            audio.play().catch(() => setIsPlaying(false));
          }
        }
      } else if (currentSong) {
        // Backend songs: fetch full audio as blob URL for reliable seeking
        const directUrl = currentSong.blobReference.getDirectURL();
        setIsLoadingAudio(true);
        try {
          const response = await fetch(directUrl);
          if (cancelled) return;
          const ab = await response.arrayBuffer();
          if (cancelled) return;
          const contentType =
            response.headers.get("content-type") || "audio/mpeg";
          const blobUrl = URL.createObjectURL(
            new Blob([ab], { type: contentType }),
          );
          currentBlobUrlRef.current = blobUrl;
          audio.src = blobUrl;
          audio.load();
          loadedSongKeyRef.current = songKey;
          setIsLoadingAudio(false);
          if (!cancelled && isPlayingRef.current) {
            audio.play().catch(() => setIsPlaying(false));
          }
        } catch {
          // Fallback to direct URL if fetch fails
          if (!cancelled) {
            audio.src = directUrl;
            audio.load();
            loadedSongKeyRef.current = songKey;
            setIsLoadingAudio(false);
            if (isPlayingRef.current) {
              audio.play().catch(() => setIsPlaying(false));
            }
          }
        }
      }

      // Revoke previous blob URL after new one is set
      if (prevBlobUrl) {
        URL.revokeObjectURL(prevBlobUrl);
      }
    };

    loadSong();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong, currentStaticSong, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setProgress(audio.currentTime);
      }
    };
    const onDurationChange = () => {
      const d = audio.duration || 0;
      setDuration(d);
    };
    const onSeeked = () => {
      isSeekingRef.current = false;
      setProgress(audio.currentTime);
    };
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
        return;
      }
      if (songQueue.length > 0) {
        let newIndex: number;
        if (shuffle && songQueue.length > 1) {
          do {
            newIndex = Math.floor(Math.random() * songQueue.length);
          } while (newIndex === songQueueIndex);
          setSongQueueIndex(newIndex);
          setCurrentSong(songQueue[newIndex]);
          setIsPlaying(true);
        } else if (songQueueIndex < songQueue.length - 1) {
          newIndex = songQueueIndex + 1;
          setSongQueueIndex(newIndex);
          setCurrentSong(songQueue[newIndex]);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      } else if (staticQueue.length > 0) {
        let newIndex: number;
        if (shuffle && staticQueue.length > 1) {
          do {
            newIndex = Math.floor(Math.random() * staticQueue.length);
          } while (newIndex === staticQueueIndex);
          setStaticQueueIndex(newIndex);
          const s = staticQueue[newIndex];
          if (s.audioUrl) {
            setCurrentStaticSong({
              title: s.title,
              artist: s.artist,
              url: s.audioUrl,
            });
          }
          setIsPlaying(true);
        } else if (staticQueueIndex < staticQueue.length - 1) {
          newIndex = staticQueueIndex + 1;
          setStaticQueueIndex(newIndex);
          const s = staticQueue[newIndex];
          if (s.audioUrl) {
            setCurrentStaticSong({
              title: s.title,
              artist: s.artist,
              url: s.audioUrl,
            });
          }
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("ended", onEnded);
    };
  }, [
    songQueue,
    songQueueIndex,
    staticQueue,
    staticQueueIndex,
    shuffle,
    repeat,
  ]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        currentStaticSong,
        isPlaying,
        isLoadingAudio,
        playSong,
        playSongFromList,
        playStaticSong,
        playStaticSongFromList,
        togglePlay,
        nextSong,
        prevSong,
        hasNext,
        hasPrev,
        audioRef,
        progress,
        duration,
        volume,
        setVolume,
        seek,
        shuffle,
        repeat,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: music streaming app, captions not applicable */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
