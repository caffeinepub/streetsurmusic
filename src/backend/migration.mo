import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldSong = {
    id : Nat;
    title : Text;
    artist : Text;
    genre : Text;
    uploader : Principal.Principal;
    blobReference : Storage.ExternalBlob;
    uploadedAt : Time.Time;
  };

  type OldActor = {
    songs : Map.Map<Nat, OldSong>;
    nextSongId : Nat;
  };

  type NewSong = {
    id : Nat;
    title : Text;
    artist : Text;
    uploader : Principal.Principal;
    blobReference : Storage.ExternalBlob;
    coverBlobReference : ?Storage.ExternalBlob;
    uploadedAt : Time.Time;
  };

  type NewActor = {
    songs : Map.Map<Nat, NewSong>;
    nextSongId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newSongs = old.songs.map<Nat, OldSong, NewSong>(
      func(_id, oldSong) {
        {
          id = oldSong.id;
          title = oldSong.title;
          artist = oldSong.artist;
          uploader = oldSong.uploader;
          blobReference = oldSong.blobReference;
          coverBlobReference = null;
          uploadedAt = oldSong.uploadedAt;
        };
      }
    );
    {
      songs = newSongs;
      nextSongId = old.nextSongId;
    };
  };
};
