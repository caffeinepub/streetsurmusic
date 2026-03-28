import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { Song, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchSongs(searchText: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "search", searchText],
    queryFn: async () => {
      if (!actor || !searchText.trim()) return [];
      return actor.searchSongs(searchText);
    },
    enabled: !!actor && !isFetching && !!searchText.trim(),
  });
}

export function useGetSongsByUser(user: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "user", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getSongsByUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile", "caller"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      artist,
      genre: _genre,
      file,
      coverFile,
      onProgress,
    }: {
      title: string;
      artist: string;
      genre?: string;
      file: File;
      coverFile?: File;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await file.arrayBuffer());
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) blob = blob.withUploadProgress(onProgress);

      let coverBlob: ExternalBlob | null = null;
      if (coverFile) {
        const coverBytes = new Uint8Array(await coverFile.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(coverBytes);
      }

      return actor.uploadSong({ title, artist }, blob, coverBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useDeleteSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSong(songId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useUpdateSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      songId,
      title,
      artist,
    }: {
      songId: bigint;
      title: string;
      artist: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSong(songId, { title, artist });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
