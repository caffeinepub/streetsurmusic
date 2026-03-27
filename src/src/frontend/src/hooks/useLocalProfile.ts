import { useCallback, useState } from "react";

export interface LocalPlaylist {
  id: string;
  name: string;
  description: string;
  songs: string[];
}

export interface LocalProfile {
  name: string;
  photo: string | null;
  bio: string;
  followers: number;
  following: number;
  playlists: LocalPlaylist[];
}

const STORAGE_KEY = "streetsurmusic_local_profile";

const DEFAULT_PROFILE: LocalProfile = {
  name: "",
  photo: null,
  bio: "",
  followers: 0,
  following: 0,
  playlists: [],
};

function loadProfile(): LocalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalProfile>;
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_PROFILE };
}

function saveProfile(p: LocalProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useLocalProfile() {
  const [profile, setProfile] = useState<LocalProfile>(loadProfile);

  const update = useCallback((partial: Partial<LocalProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      saveProfile(next);
      return next;
    });
  }, []);

  const updatePhoto = useCallback(
    (photo: string | null) => {
      update({ photo });
    },
    [update],
  );

  const updateBio = useCallback(
    (bio: string) => {
      update({ bio });
    },
    [update],
  );

  const updateName = useCallback(
    (name: string) => {
      update({ name });
    },
    [update],
  );

  const addPlaylist = useCallback((pl: Omit<LocalPlaylist, "id">) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        playlists: [...prev.playlists, { ...pl, id: crypto.randomUUID() }],
      };
      saveProfile(next);
      return next;
    });
  }, []);

  const editPlaylist = useCallback(
    (id: string, updates: Partial<Omit<LocalPlaylist, "id">>) => {
      setProfile((prev) => {
        const next = {
          ...prev,
          playlists: prev.playlists.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        };
        saveProfile(next);
        return next;
      });
    },
    [],
  );

  const deletePlaylist = useCallback((id: string) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        playlists: prev.playlists.filter((p) => p.id !== id),
      };
      saveProfile(next);
      return next;
    });
  }, []);

  return {
    profile,
    updatePhoto,
    updateBio,
    updateName,
    addPlaylist,
    editPlaylist,
    deletePlaylist,
  };
}
