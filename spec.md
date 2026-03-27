# streetsurmusic

## Current State
Full music app. Upload accessible to all logged-in users. Playlists have description field, no ability to add songs.

## Requested Changes (Diff)

### Add
- Owner-only upload restriction (localStorage-based ownership claim)
- addSongToPlaylist/removeSongFromPlaylist in useLocalProfile
- Add to Playlist button on songs

### Modify
- Remove description from playlists everywhere
- Sidebar: hide Upload for non-owners
- Upload: show claim/access-denied flow

### Remove
- Description from playlist dialog and cards
