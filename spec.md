# streetsurmusic

## Current State
Music platform with song upload (owner only), playback, playlists (local), and profile management. Songs currently have no cover image. Song cards show a music icon placeholder. No 3-dot menu on song cards. Playlists store song IDs but have no delete-song option in the playlist view.

## Requested Changes (Diff)

### Add
- `coverBlobReference: ?Storage.ExternalBlob` optional field on Song type in backend
- `updateSong(songId, metadata)` backend function to edit title/artist (owner/admin only)
- Cover photo upload field in Upload page (owner only) — any image format, shown as thumbnail
- Song card now shows cover photo as thumbnail if available, else music icon
- 3-dot dropdown menu on real song cards (owner only): Delete and Edit options
- Edit Song dialog (owner only): change title, artist
- Playlist view in Profile: each song in a playlist shows a remove/delete button

### Modify
- `uploadSong` backend accepts optional `coverBlobReference: ?Storage.ExternalBlob`
- `SongCard` for real songs: show cover image, add 3-dot menu (owner only)
- `Upload.tsx`: add cover photo dropzone/picker field
- `Profile.tsx` playlist section: show songs list with remove button
- `useQueries.ts`: add `useUpdateSong` mutation, update `useUploadSong` to send cover blob

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend with optional coverBlobReference on Song and updateSong endpoint
2. Update Upload page: add image file picker, upload cover as ExternalBlob, pass to uploadSong
3. Update SongCard: show cover image thumbnail (song.coverBlobReference.getDirectURL()), add 3-dot MoreVertical menu with Delete/Edit (only when user is owner)
4. Add EditSongDialog inside SongCard or Home/Explore pages
5. Update Profile playlists section: show songs with remove button (remove from playlist, not delete from backend)
6. Add useUpdateSong hook in useQueries.ts
