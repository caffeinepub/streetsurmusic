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
  playSong: (song: Song) => void;
  playStaticSong: (song: SampleSong) => void;
  togglePlay: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  progress: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  seek: (pct: number) => void;
  // Queue and navigation
  songQueue: Song[];
  setSongQueue: (songs: Song[]) => void;
  skipNext: () => void;
  skipPrev: () => void;
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [songQueue, setSongQueueState] = useState<Song[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSongRef = useRef<Song | null>(null);
  const songQueueRef = useRef<Song[]>([]);
  const shuffleRef = useRef(false);
  const repeatRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);
  useEffect(() => {
    songQueueRef.current = songQueue;
  }, [songQueue]);
  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const setSongQueue = useCallback((songs: Song[]) => {
    setSongQueueState(songs);
  }, []);

  const playSong = useCallback((song: Song) => {
    setCurrentStaticSong(null);
    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  const playStaticSong = useCallback((song: SampleSong) => {
    if (!song.audioUrl) return;
    setCurrentSong(null);
    setCurrentStaticSong({
      title: song.title,
      artist: song.artist,
      url: song.audioUrl,
    });
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  const seek = useCallback(
    (pct: number) => {
      if (audioRef.current && duration) {
        audioRef.current.currentTime = pct * duration;
      }
    },
    [duration],
  );

  const skipNext = useCallback(() => {
    const queue = songQueueRef.current;
    const cur = currentSongRef.current;
    if (!queue.length) return;
    if (shuffleRef.current) {
      const idx = Math.floor(Math.random() * queue.length);
      playSong(queue[idx]);
      return;
    }
    const curIdx = cur ? queue.findIndex((s) => s.id === cur.id) : -1;
    const nextIdx = (curIdx + 1) % queue.length;
    playSong(queue[nextIdx]);
  }, [playSong]);

  const skipPrev = useCallback(() => {
    const queue = songQueueRef.current;
    const cur = currentSongRef.current;
    if (!queue.length) return;
    const curIdx = cur ? queue.findIndex((s) => s.id === cur.id) : -1;
    const prevIdx = curIdx <= 0 ? queue.length - 1 : curIdx - 1;
    playSong(queue[prevIdx]);
  }, [playSong]);

  const toggleShuffle = useCallback(() => setShuffle((v) => !v), []);
  const toggleRepeat = useCallback(() => setRepeat((v) => !v), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let url: string | null = null;
    if (currentStaticSong) {
      url = currentStaticSong.url;
    } else if (currentSong) {
      url = currentSong.blobReference.getDirectURL();
    }

    if (!url) return;

    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentSong, currentStaticSong, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatRef.current && audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const queue = songQueueRef.current;
      const cur = currentSongRef.current;
      if (queue.length > 1 && cur) {
        if (shuffleRef.current) {
          const idx = Math.floor(Math.random() * queue.length);
          playSong(queue[idx]);
        } else {
          const curIdx = queue.findIndex((s) => s.id === cur.id);
          const nextIdx = curIdx + 1;
          if (nextIdx < queue.length) {
            playSong(queue[nextIdx]);
          } else {
            setIsPlaying(false);
          }
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playSong]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        currentStaticSong,
        isPlaying,
        playSong,
        playStaticSong,
        togglePlay,
        audioRef,
        progress,
        duration,
        volume,
        setVolume,
        seek,
        songQueue,
        setSongQueue,
        skipNext,
        skipPrev,
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
