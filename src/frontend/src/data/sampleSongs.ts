export interface SampleSong {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  genre: string;
  year: number;
  audioUrl?: string;
}

export const SAMPLE_SONGS: SampleSong[] = [
  {
    id: "uploaded-1",
    title: "Fanatic Blind Love Party",
    artist: "Fanatic",
    cover: "/assets/generated/cover-street-beats.dim_300x300.jpg",
    duration: "",
    genre: "Bollywood",
    year: 2024,
    audioUrl:
      "/assets/uploads/fanatic_blind_love_party-019d2ee5-4503-704f-ac56-e06e3b118d01-1.mp3",
  },
  {
    id: "s1",
    title: "Dil Ka Haal",
    artist: "Arjun Shah",
    cover: "/assets/generated/cover-dil-ka-haal.dim_300x300.jpg",
    duration: "3:42",
    genre: "Bollywood",
    year: 2023,
  },
  {
    id: "s2",
    title: "Mumbai Nights",
    artist: "Priya Kapoor",
    cover: "/assets/generated/cover-mumbai-nights.dim_300x300.jpg",
    duration: "4:15",
    genre: "Indie",
    year: 2024,
  },
  {
    id: "s3",
    title: "Street Beats",
    artist: "DJ Ravi",
    cover: "/assets/generated/cover-street-beats.dim_300x300.jpg",
    duration: "3:58",
    genre: "Hip-Hop",
    year: 2025,
  },
  {
    id: "s4",
    title: "Desi Groove",
    artist: "The Collective",
    cover: "/assets/generated/cover-desi-groove.dim_300x300.jpg",
    duration: "5:02",
    genre: "Electronic",
    year: 2022,
  },
  {
    id: "s5",
    title: "Electric Dreams",
    artist: "Nova Sound",
    cover: "/assets/generated/cover-electric-dreams.dim_300x300.jpg",
    duration: "4:33",
    genre: "Pop",
    year: 2025,
  },
  {
    id: "s6",
    title: "Raah Mein",
    artist: "Kabir & Meera",
    cover: "/assets/generated/cover-dil-ka-haal.dim_300x300.jpg",
    duration: "3:21",
    genre: "Bollywood",
    year: 2023,
  },
];
