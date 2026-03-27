import { Play, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { Song } from "../backend";
import { AddToPlaylistButton } from "../components/AddToPlaylistButton";
import { SongCard } from "../components/SongCard";
import { usePlayer } from "../context/PlayerContext";
import { SAMPLE_SONGS } from "../data/sampleSongs";
import { useGetAllSongs } from "../hooks/useQueries";

export function Home() {
  const { data: songs = [], isLoading } = useGetAllSongs();
  const { playSong, currentSong, isPlaying } = usePlayer();

  const hasRealSongs = songs.length > 0;

  return (
    <div className="space-y-8">
      {/* Hero — T-Series bold banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden h-52 md:h-72"
      >
        <img
          src="/assets/generated/hero-banner.dim_1200x400.jpg"
          alt="streetsurmusic"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Strong red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-black/70 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Red glow orb */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary/30 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">
            India Ka Music
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-none tracking-tight">
            <span className="font-display text-primary">streetsur</span>
            <span className="font-display text-foreground">music</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-sm">
            Discover and experience the finest music. Stream, explore, and vibe.
          </p>
        </div>
      </motion.div>

      {/* Featured */}
      <section data-ocid="home.section">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold tracking-tight">
            Featured Tracks
          </h2>
        </div>
        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="home.loading_state"
          >
            {Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((key) => (
              <div key={key} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="aspect-square rounded-md bg-muted mb-3" />
                <div className="h-3 bg-muted rounded mb-2 w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : hasRealSongs ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {songs.slice(0, 5).map((song: Song, i: number) => (
              <SongCard
                key={song.id.toString()}
                song={song}
                isPlaying={isPlaying && currentSong?.id === song.id}
                onPlay={playSong}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {SAMPLE_SONGS.slice(0, 5).map((s, i) => (
              <SongCard key={s.id} sampleSong={s} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Recent */}
      <section data-ocid="home.recent.section">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold tracking-tight">
            Recently Added
          </h2>
        </div>
        <div className="space-y-2">
          {(hasRealSongs ? songs.slice(0, 6) : SAMPLE_SONGS).map((item, i) => {
            if ("id" in item && typeof item.id === "bigint") {
              const song = item as Song;
              return (
                <motion.div
                  key={song.id.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => playSong(song)}
                  data-ocid={`home.recent.item.${i + 1}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary cursor-pointer transition-colors group border border-transparent hover:border-primary/10"
                >
                  <span className="text-muted-foreground text-sm w-5 text-center group-hover:hidden">
                    {i + 1}
                  </span>
                  <Play className="w-4 h-4 text-primary hidden group-hover:block flex-shrink-0" />
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-primary/30 to-accent/20 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      Number(song.uploadedAt / BigInt(1e6)),
                    ).toLocaleDateString()}
                  </p>
                  <AddToPlaylistButton
                    songId={song.id.toString()}
                    className="opacity-0 group-hover:opacity-100"
                  />
                </motion.div>
              );
            }
            const s = item as (typeof SAMPLE_SONGS)[0];
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`home.recent.item.${i + 1}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary cursor-pointer transition-colors group border border-transparent hover:border-primary/10"
              >
                <span className="text-muted-foreground text-sm w-5 text-center group-hover:hidden">
                  {i + 1}
                </span>
                <Play className="w-4 h-4 text-primary hidden group-hover:block flex-shrink-0" />
                <img
                  src={s.cover}
                  alt={s.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.artist}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{s.duration}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
