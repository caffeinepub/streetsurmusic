import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  ImagePlus,
  Music,
  Upload as UploadIcon,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useUploadSong } from "../hooks/useQueries";

const GENRES = [
  "Bollywood",
  "Hip Hop",
  "Pop",
  "Rock",
  "Electronic",
  "Indie",
  "Classical",
  "Other",
];

export function Upload() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const {
    mutateAsync: uploadSong,
    isPending,
    isSuccess,
    reset,
  } = useUploadSong();

  const handleFile = (f: File) => {
    if (f.type.startsWith("audio/")) {
      setFile(f);
    } else {
      toast.error("Please select an audio file (MP3, WAV, etc.)");
    }
  };

  const handleCoverPhoto = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setCoverPhotoUrl(result);
      }
    };
    reader.readAsDataURL(f);
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
    if (!title.trim() || !artist.trim() || !file || !genre) {
      toast.error("Please fill all fields and select a file");
      return;
    }
    try {
      setUploadProgress(0);
      await uploadSong({
        title: title.trim(),
        artist: artist.trim(),
        genre,
        coverPhotoUrl,
        file,
        onProgress: setUploadProgress,
      });
      toast.success("Song uploaded successfully!");
      setTitle("");
      setArtist("");
      setGenre("");
      setCoverPhotoUrl(null);
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
    setGenre("");
    setCoverPhotoUrl(null);
    setFile(null);
    setUploadProgress(0);
  };

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
          <Label htmlFor="genre-select">Genre</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger
              id="genre-select"
              data-ocid="upload.select"
              className="bg-card border-border"
            >
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cover Photo */}
        <div className="space-y-2">
          <Label>Cover Photo (optional)</Label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              data-ocid="upload.upload_button"
              onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
            >
              <ImagePlus className="w-4 h-4" />
              {coverPhotoUrl ? "Change Photo" : "Add Cover Photo"}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleCoverPhoto(e.target.files[0])
              }
            />
            {coverPhotoUrl && (
              <div className="relative">
                <img
                  src={coverPhotoUrl}
                  alt="Cover preview"
                  className="w-14 h-14 rounded-md object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => setCoverPhotoUrl(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
          </div>
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
              className={`w-10 h-10 mx-auto mb-3 ${
                file ? "text-primary" : "text-muted-foreground"
              }`}
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
          disabled={isPending || !title || !artist || !genre || !file}
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
