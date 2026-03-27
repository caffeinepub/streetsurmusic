import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Lock, Music, Upload as UploadIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOwner } from "../hooks/useOwner";
import { useUploadSong } from "../hooks/useQueries";

const GENRES = [
  "Pop",
  "Hip Hop",
  "Rock",
  "Electronic",
  "Jazz & Blues",
  "Classical",
  "Folk & Country",
  "R&B",
  "Bollywood",
  "Reggae & Latin",
];

function detectGenre(title: string, artist: string): string {
  const text = `${title} ${artist}`.toLowerCase();
  if (/hip.?hop|rap|trap|drill|freestyle|cypher/.test(text)) return "Hip Hop";
  if (/rock|metal|punk|grunge|indie/.test(text)) return "Rock";
  if (/pop|dance|disco|edm|electronic|house|techno|dj/.test(text))
    return "Electronic";
  if (/jazz|blues|soul|funk|groove/.test(text)) return "Jazz & Blues";
  if (/classical|symphony|orchestra|piano|violin/.test(text))
    return "Classical";
  if (/folk|acoustic|country|bluegrass/.test(text)) return "Folk & Country";
  if (/r&b|rnb|rhythm|neo.?soul/.test(text)) return "R&B";
  if (/bollywood|hindi|filmi|desi|punjabi|bhangra/.test(text))
    return "Bollywood";
  if (/reggae|reggaeton|latin|salsa/.test(text)) return "Reggae & Latin";
  return "Pop";
}

export function Upload() {
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();
  const { isOwner, hasOwner, claimOwnership } = useOwner(principalStr);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Pop");
  const [autoDetected, setAutoDetected] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    mutateAsync: uploadSong,
    isPending,
    isSuccess,
    reset,
  } = useUploadSong();

  useEffect(() => {
    if (title.trim() || artist.trim()) {
      const detected = detectGenre(title, artist);
      setGenre(detected);
      setAutoDetected(true);
    }
  }, [title, artist]);

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenre(e.target.value);
    setAutoDetected(false);
  };

  const handleFile = (f: File) => {
    if (f.type.startsWith("audio/")) {
      setFile(f);
    } else {
      toast.error("Please select an audio file (MP3, WAV, etc.)");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleDropzoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !file) {
      toast.error("Please fill all fields and select a file");
      return;
    }
    try {
      setUploadProgress(0);
      await uploadSong({
        title: title.trim(),
        artist: artist.trim(),
        genre,
        file,
        onProgress: setUploadProgress,
      });
      toast.success("Song uploaded successfully!");
      setTitle("");
      setArtist("");
      setGenre("Pop");
      setAutoDetected(false);
      setFile(null);
      setUploadProgress(0);
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleNewUpload = () => {
    reset();
    setTitle("");
    setArtist("");
    setGenre("Pop");
    setAutoDetected(false);
    setFile(null);
    setUploadProgress(0);
  };

  // Ownership gate
  if (!hasOwner) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16 space-y-5"
        data-ocid="upload.section"
      >
        <UploadIcon className="w-14 h-14 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Claim Site Ownership</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Koi bhi site owner nahi hai abhi. Apne aap ko owner set karein taaki
          aap songs upload kar sakein.
        </p>
        {principalStr ? (
          <Button
            onClick={() => claimOwnership(principalStr)}
            data-ocid="upload.primary_button"
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Claim Ownership
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Pehle login karein, phir ownership claim karein.
          </p>
        )}
      </motion.div>
    );
  }

  if (hasOwner && !isOwner) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16 space-y-5"
        data-ocid="upload.section"
      >
        <Lock className="w-14 h-14 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          Sirf site owner songs upload kar sakta hai.
        </p>
      </motion.div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16"
        data-ocid="upload.success_state"
      >
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
        <p className="text-muted-foreground mb-6">
          Your song is now live on streetsurmusic.
        </p>
        <Button onClick={handleNewUpload} data-ocid="upload.primary_button">
          Upload Another Song
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
      data-ocid="upload.section"
    >
      <div className="flex items-center gap-2 mb-6">
        <UploadIcon className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Upload a Track</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="song-title">Song Title</Label>
          <Input
            id="song-title"
            data-ocid="upload.title.input"
            placeholder="Enter song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-card border-border focus:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artist-name">Artist Name</Label>
          <Input
            id="artist-name"
            data-ocid="upload.artist.input"
            placeholder="Enter artist name"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="bg-card border-border focus:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="song-genre">Genre</Label>
            {autoDetected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                Auto-detected
              </span>
            )}
          </div>
          <select
            id="song-genre"
            data-ocid="upload.genre.select"
            value={genre}
            onChange={handleGenreChange}
            className="w-full h-10 px-3 rounded-md bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Dropzone */}
        <div className="space-y-2">
          <Label>Audio File</Label>
          <label
            data-ocid="upload.dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onKeyDown={handleDropzoneKeyDown}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : file
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
            <Music
              className={`w-10 h-10 mx-auto mb-3 ${file ? "text-primary" : "text-muted-foreground"}`}
            />
            {file ? (
              <>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">
                  Drop your audio file here
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  or click to browse — MP3, WAV, FLAC, OGG
                </p>
              </>
            )}
          </label>
        </div>

        {isPending && uploadProgress > 0 && (
          <div className="space-y-1" data-ocid="upload.loading_state">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || !title || !artist || !file}
          data-ocid="upload.submit_button"
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Song
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
