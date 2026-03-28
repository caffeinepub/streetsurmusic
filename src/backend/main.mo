import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  module Song {
    public func compare(song1 : Song, song2 : Song) : Order.Order {
      Nat.compare(song1.id, song2.id);
    };
  };

  type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    uploader : Principal;
    blobReference : Storage.ExternalBlob;
    coverBlobReference : ?Storage.ExternalBlob;
    uploadedAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  // Authentication system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  var nextSongId = 0;
  let songs = Map.empty<Nat, Song>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Song management functions
  public shared ({ caller }) func uploadSong(metadata : { title : Text; artist : Text }, blobReference : Storage.ExternalBlob, coverBlobReference : ?Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload songs");
    };
    let songId = nextSongId;
    nextSongId += 1;
    let song : Song = {
      id = songId;
      title = metadata.title;
      artist = metadata.artist;
      uploader = caller;
      blobReference;
      coverBlobReference;
      uploadedAt = Time.now();
    };
    songs.add(songId, song);
    songId;
  };

  public shared ({ caller }) func updateSong(songId : Nat, metadata : { title : Text; artist : Text }) : async () {
    switch (songs.get(songId)) {
      case (null) { Runtime.trap("Song does not exist") };
      case (?song) {
        if (song.uploader != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Only the uploader or an admin can update this song");
        };
        let updatedSong : Song = {
          song with
          title = metadata.title;
          artist = metadata.artist;
        };
        songs.add(songId, updatedSong);
      };
    };
  };

  public shared ({ caller }) func deleteSong(songId : Nat) : async () {
    switch (songs.get(songId)) {
      case (null) { Runtime.trap("Song does not exist") };
      case (?song) {
        if (song.uploader != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Only the uploader or an admin can delete this song");
        };
        songs.remove(songId);
      };
    };
  };

  public query func getAllSongs() : async [Song] {
    songs.values().toArray().sort();
  };

  public query func getSongsByUser(user : Principal) : async [Song] {
    songs.values().toArray().filter(
      func(song) {
        song.uploader == user;
      }
    ).sort();
  };

  public query func getSongsByArtist(artistName : Text) : async [Song] {
    songs.values().toArray().filter(
      func(song) {
        song.artist == artistName;
      }
    ).sort();
  };

  public query func searchSongs(searchText : Text) : async [Song] {
    songs.values().toArray().filter(
      func(song) {
        song.title.toLower().contains(#text (searchText.toLower())) or song.artist.toLower().contains(#text (searchText.toLower()));
      }
    ).sort();
  };

  public query func getSongById(songId : Nat) : async Song {
    switch (songs.get(songId)) {
      case (null) { Runtime.trap("Song does not exist") };
      case (?song) { song };
    };
  };
};
