import { useState } from "react";

const STORAGE_KEY = "streetsurmusic_followed_artists";

function loadFollowed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFollowed(artists: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artists));
}

export function useFollowedArtists() {
  const [followedArtists, setFollowedArtists] =
    useState<string[]>(loadFollowed);

  const followArtist = (name: string) => {
    setFollowedArtists((prev) => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      saveFollowed(next);
      return next;
    });
  };

  const unfollowArtist = (name: string) => {
    setFollowedArtists((prev) => {
      const next = prev.filter((a) => a !== name);
      saveFollowed(next);
      return next;
    });
  };

  const isFollowing = (name: string) => followedArtists.includes(name);

  const toggleFollow = (name: string) => {
    if (isFollowing(name)) {
      unfollowArtist(name);
    } else {
      followArtist(name);
    }
  };

  return {
    followedArtists,
    followArtist,
    unfollowArtist,
    isFollowing,
    toggleFollow,
  };
}
