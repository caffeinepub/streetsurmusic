import { Search } from "lucide-react";
import type { Song } from "../backend";
import { SongCard } from "../components/SongCard";
import { useNavigation } from "../context/NavigationContext";
import { usePlayer } from "../context/PlayerContext";
import { useSearchSongs } from "../hooks/useQueries";

export function SearchResults() {
  const { searchQuery } = useNavigation();
  const { data: songs = [], isLoading } = useSearchSongs(searchQuery);
  const { playSong, currentSong, isPlaying } = usePlayer();

  return (
    <div data-ocid="search.section">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">
          Search results for{" "}
          <span className="text-primary">&ldquo;{searchQuery}&rdquo;</span>
        </h2>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          data-ocid="search.loading_state"
        >
          {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
            <div key={key} className="bg-card rounded-lg p-4 animate-pulse">
              <div className="aspect-square rounded-md bg-muted mb-3" />
              <div className="h-3 bg-muted rounded mb-2 w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="search.empty_state"
        >
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">
            No results found for &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song: Song, i: number) => (
            <SongCard
              key={song.id.toString()}
              song={song}
              isPlaying={isPlaying && currentSong?.id === song.id}
              onPlay={playSong}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
