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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

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

  const seek = useCallback(
    (pct: number) => {
      if (audioRef.current && duration) {
        audioRef.current.currentTime = pct * duration;
      }
    },
    [duration],
  );

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
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
        return;
      }
      // Auto-play next song if available
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
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
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
