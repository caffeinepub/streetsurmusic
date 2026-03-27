import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Edit2,
  ListMusic,
  Loader2,
  Music,
  Pencil,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Song } from "../backend";
import { usePlayer } from "../context/PlayerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { LocalPlaylist } from "../hooks/useLocalProfile";
import { useLocalProfile } from "../hooks/useLocalProfile";
import {
  useDeleteSong,
  useGetCallerProfile,
  useGetSongsByUser,
  useSaveCallerProfile,
} from "../hooks/useQueries";

export function Profile() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal();

  const { data: profile } = useGetCallerProfile();
  const { data: songs = [], isLoading } = useGetSongsByUser(principal);
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { mutateAsync: deleteSong, isPending: isDeleting } = useDeleteSong();
  const { mutateAsync: saveProfile, isPending: isSaving } =
    useSaveCallerProfile();

  const {
    profile: localProfile,
    updatePhoto,
    updateBio,
    updateName,
    addPlaylist,
    editPlaylist,
    deletePlaylist,
  } = useLocalProfile();

  // Edit profile dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Playlist dialogs
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<LocalPlaylist | null>(
    null,
  );
  const [plName, setPlName] = useState("");
  const [plDesc, setPlDesc] = useState("");

  if (!isLoggedIn) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 gap-4"
        data-ocid="profile.section"
      >
        <User className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-bold">Login to view your profile</h2>
        <p className="text-muted-foreground text-sm">
          Manage your music and playlists.
        </p>
        <Button
          onClick={login}
          data-ocid="profile.login.button"
          className="bg-primary hover:bg-primary/90"
        >
          Login
        </Button>
      </div>
    );
  }

  const initials = principal?.toString().slice(0, 2).toUpperCase() ?? "U";
  const displayName =
    localProfile.name ||
    profile?.name ||
    `${principal?.toString().slice(0, 12)}...`;

  const openEditDialog = () => {
    setEditName(localProfile.name || profile?.name || "");
    setEditBio(localProfile.bio);
    setEditPhotoPreview(localProfile.photo);
    setEditOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      await saveProfile({ name: editName });
      updateName(editName);
      updateBio(editBio);
      updatePhoto(editPhotoPreview);
      toast.success("Profile saved!");
      setEditOpen(false);
    } catch {
      // Backend call failed, still save locally
      updateName(editName);
      updateBio(editBio);
      updatePhoto(editPhotoPreview);
      toast.success("Profile saved locally!");
      setEditOpen(false);
    }
  };

  const handleDelete = async (songId: bigint) => {
    try {
      await deleteSong(songId);
      toast.success("Song deleted");
    } catch {
      toast.error("Failed to delete song");
    }
  };

  const openAddPlaylist = () => {
    setEditingPlaylist(null);
    setPlName("");
    setPlDesc("");
    setPlaylistDialogOpen(true);
  };

  const openEditPlaylist = (pl: LocalPlaylist) => {
    setEditingPlaylist(pl);
    setPlName(pl.name);
    setPlDesc(pl.description);
    setPlaylistDialogOpen(true);
  };

  const handleSavePlaylist = () => {
    if (!plName.trim()) {
      toast.error("Playlist name required");
      return;
    }
    if (editingPlaylist) {
      editPlaylist(editingPlaylist.id, { name: plName, description: plDesc });
      toast.success("Playlist updated");
    } else {
      addPlaylist({ name: plName, description: plDesc, songs: [] });
      toast.success("Playlist created");
    }
    setPlaylistDialogOpen(false);
  };

  const handleDeletePlaylist = (id: string) => {
    deletePlaylist(id);
    toast.success("Playlist deleted");
  };

  return (
    <div className="space-y-8" data-ocid="profile.section">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 bg-card rounded-2xl border border-border overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with edit overlay */}
          <button
            type="button"
            className="relative group cursor-pointer"
            onClick={openEditDialog}
          >
            <Avatar className="w-24 h-24 border-2 border-primary/50 shadow-lg shadow-primary/20">
              {localProfile.photo ? (
                <AvatarImage src={localProfile.photo} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">{displayName}</h2>
            {localProfile.bio && (
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                {localProfile.bio}
              </p>
            )}
            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold">{localProfile.followers}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold">{localProfile.following}</span>
                <span className="text-muted-foreground">Following</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <Music className="w-4 h-4 text-primary" />
                <span className="font-semibold">{songs.length}</span>
                <span className="text-muted-foreground">Tracks</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={openEditDialog}
            data-ocid="profile.edit_button"
            className="border-primary/40 hover:border-primary hover:bg-primary/10 shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="bg-card border-border max-w-md"
          data-ocid="profile.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Photo upload */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="relative group cursor-pointer"
                onClick={() => photoInputRef.current?.click()}
              >
                <Avatar className="w-20 h-20 border-2 border-primary/50">
                  {editPhotoPreview ? (
                    <AvatarImage src={editPhotoPreview} />
                  ) : null}
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
                data-ocid="profile.upload_button"
                className="border-primary/40 hover:bg-primary/10 text-xs"
              >
                <Camera className="w-3 h-3 mr-1" /> Change Photo
              </Button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                data-ocid="profile.input"
                className="bg-background border-border"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                data-ocid="profile.textarea"
                className="bg-background border-border resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              data-ocid="profile.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              data-ocid="profile.save_button"
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Playlists Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Your Playlists</h3>
            <span className="text-xs text-muted-foreground bg-card border border-border rounded-full px-2 py-0.5">
              {localProfile.playlists.length}
            </span>
          </div>
          <Button
            size="sm"
            onClick={openAddPlaylist}
            data-ocid="profile.open_modal_button"
            className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> New Playlist
          </Button>
        </div>

        {localProfile.playlists.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl"
            data-ocid="profile.empty_state"
          >
            <ListMusic className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No playlists yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {localProfile.playlists.map((pl, i) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`profile.item.${i + 1}`}
                className="p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{pl.name}</p>
                    {pl.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {pl.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {pl.songs.length} songs
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 hover:bg-primary/20 hover:text-primary"
                      onClick={() => openEditPlaylist(pl)}
                      data-ocid={`profile.edit_button.${i + 1}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => handleDeletePlaylist(pl.id)}
                      data-ocid={`profile.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Playlist Add/Edit Dialog */}
      <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm"
          data-ocid="profile.modal"
        >
          <DialogHeader>
            <DialogTitle>
              {editingPlaylist ? "Edit Playlist" : "New Playlist"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pl-name">Playlist Name</Label>
              <Input
                id="pl-name"
                value={plName}
                onChange={(e) => setPlName(e.target.value)}
                placeholder="My Playlist"
                data-ocid="profile.input"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pl-desc">Description</Label>
              <Textarea
                id="pl-desc"
                value={plDesc}
                onChange={(e) => setPlDesc(e.target.value)}
                placeholder="What's this playlist about?"
                rows={2}
                data-ocid="profile.textarea"
                className="bg-background border-border resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPlaylistDialogOpen(false)}
              data-ocid="profile.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePlaylist}
              data-ocid="profile.confirm_button"
              className="bg-primary hover:bg-primary/90"
            >
              {editingPlaylist ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Uploaded Songs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Your Uploads</h3>
        </div>

        {isLoading ? (
          <div className="space-y-2" data-ocid="profile.loading_state">
            {Array.from({ length: 4 }, (_, i) => `sk-${i}`).map((key) => (
              <div
                key={key}
                className="h-16 bg-card rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl"
            data-ocid="profile.empty_state"
          >
            <Music className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No songs uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song: Song, i: number) => (
              <motion.div
                key={song.id.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`profile.item.${i + 1}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary transition-colors group border border-transparent hover:border-border"
              >
                <button
                  type="button"
                  onClick={() => playSong(song)}
                  className="w-10 h-10 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 hover:from-primary/40 hover:to-accent/40 transition-colors"
                >
                  <Music className="w-4 h-4 text-primary" />
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${currentSong?.id === song.id && isPlaying ? "text-primary" : ""}`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {new Date(
                    Number(song.uploadedAt / BigInt(1e6)),
                  ).toLocaleDateString()}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(song.id)}
                  disabled={isDeleting}
                  data-ocid={`profile.delete_button.${i + 1}`}
                  className="w-8 h-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
