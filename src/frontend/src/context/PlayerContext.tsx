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

  const isPlayingRef = useRef(false);
  const currentBlobUrlRef = useRef<string | null>(null);
  const loadedSongKeyRef = useRef<string | null>(null);

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
      // Find the first playable song if the selected one has no audio
      let startIndex = index;
      if (!songs[index]?.audioUrl) {
        const next = songs.findIndex((s, i) => i > index && s.audioUrl);
        const prev = songs
          .slice(0, index)
          .reverse()
          .findIndex((s) => s.audioUrl);
        if (next !== -1) startIndex = next;
        else if (prev !== -1) startIndex = index - 1 - prev;
        else return; // no playable songs
      }
      setStaticQueue(songs);
      setStaticQueueIndex(startIndex);
      setCurrentSong(null);
      const s = songs[startIndex];
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
      // Skip songs with no audio
      const candidates = staticQueue.slice(newIndex).filter((s) => s.audioUrl);
      if (candidates.length === 0) return;
      const actualIndex = staticQueue.indexOf(candidates[0]);
      setStaticQueueIndex(actualIndex);
      const s = staticQueue[actualIndex];
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
      // Find previous song with audio
      const prevCandidates = staticQueue
        .slice(0, staticQueueIndex)
        .reverse()
        .filter((s) => s.audioUrl);
      if (prevCandidates.length === 0) {
        if (audioRef.current) audioRef.current.currentTime = 0;
        return;
      }
      const newIndex = staticQueue.lastIndexOf(prevCandidates[0]);
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
    audio.currentTime = pct * dur;
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Main audio loading effect — ALWAYS load audio as blob URL for reliable seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let songKey: string | null = null;
    if (currentStaticSong) {
      songKey = `static:${currentStaticSong.url}`;
    } else if (currentSong) {
      songKey = `backend:${String(currentSong.id)}`;
    }

    const songChanged = loadedSongKeyRef.current !== songKey;

    if (!songChanged) {
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      } else {
        audio.pause();
      }
      return;
    }

    let cancelled = false;
    loadedSongKeyRef.current = null;

    const prevBlobUrl = currentBlobUrlRef.current;
    currentBlobUrlRef.current = null;

    const loadSong = async () => {
      if (currentStaticSong || currentSong) {
        // ALWAYS fetch as blob URL — this ensures seeking always works
        // because all audio data is in memory (no HTTP range requests needed)
        const url = currentStaticSong
          ? currentStaticSong.url
          : currentSong!.blobReference.getDirectURL();

        setIsLoadingAudio(true);
        try {
          const response = await fetch(url);
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
            const directUrl = currentStaticSong
              ? currentStaticSong.url
              : currentSong!.blobReference.getDirectURL();
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
      setProgress(audio.currentTime);
    };
    const onDurationChange = () => {
      const d = audio.duration || 0;
      setDuration(d);
    };
    const onSeeked = () => {
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
      <audio ref={audioRef} preload="auto" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
