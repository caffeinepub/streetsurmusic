import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    genre : Text;
    coverPhotoUrl : ?Text;
    uploader : Principal;
    blobReference : Storage.ExternalBlob;
    uploadedAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  stable var nextSongId : Nat = 0;
  stable var stableSongsData : [(Nat, Song)] = [];
  stable var stableUserProfilesData : [(Principal, UserProfile)] = [];

  let songs = Map.empty<Nat, Song>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  system func preupgrade() {
    stableSongsData := Iter.toArray(songs.entries());
    stableUserProfilesData := Iter.toArray(userProfiles.entries());
  };

  system func postupgrade() {
    for ((k, v) in stableSongsData.vals()) {
      songs.add(k, v);
    };
    stableSongsData := [];
    for ((k, v) in stableUserProfilesData.vals()) {
      userProfiles.add(k, v);
    };
    stableUserProfilesData := [];
  };

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (Principal.isAnonymous(caller)) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (Principal.isAnonymous(caller)) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    userProfiles.add(caller, profile);
  };

  // Song management functions
  public shared ({ caller }) func uploadSong(
    metadata : { title : Text; artist : Text; genre : Text; coverPhotoUrl : ?Text },
    blobReference : Storage.ExternalBlob
  ) : async Nat {
    if (Principal.isAnonymous(caller)) {
      Runtime.trap("Unauthorized: Must be logged in to upload songs");
    };
    let songId = nextSongId;
    nextSongId += 1;
    let song : Song = {
      id = songId;
      title = metadata.title;
      artist = metadata.artist;
      genre = metadata.genre;
      coverPhotoUrl = metadata.coverPhotoUrl;
      uploader = caller;
      blobReference;
      uploadedAt = Time.now();
    };
    songs.add(songId, song);
    songId;
  };

  public query func getAllSongs() : async [Song] {
    let arr = songs.values().toArray();
    Array.sort(arr, func(a : Song, b : Song) : Order.Order { Nat.compare(a.id, b.id) });
  };

  public query func getSongsByUser(user : Principal) : async [Song] {
    let arr = songs.values().toArray();
    let filtered = Array.filter(arr, func(song : Song) : Bool { song.uploader == user });
    Array.sort(filtered, func(a : Song, b : Song) : Order.Order { Nat.compare(a.id, b.id) });
  };

  public query func getSongsByArtist(artistName : Text) : async [Song] {
    let arr = songs.values().toArray();
    let filtered = Array.filter(arr, func(song : Song) : Bool { song.artist == artistName });
    Array.sort(filtered, func(a : Song, b : Song) : Order.Order { Nat.compare(a.id, b.id) });
  };

  public query func searchSongs(searchText : Text) : async [Song] {
    let arr = songs.values().toArray();
    let filtered = Array.filter(
      arr,
      func(song : Song) : Bool {
        song.title.toLower().contains(#text (searchText.toLower())) or
        song.artist.toLower().contains(#text (searchText.toLower()))
      }
    );
    Array.sort(filtered, func(a : Song, b : Song) : Order.Order { Nat.compare(a.id, b.id) });
  };

  public shared ({ caller }) func deleteSong(songId : Nat) : async () {
    switch (songs.get(songId)) {
      case (null) { Runtime.trap("Song does not exist") };
      case (?song) {
        if (song.uploader != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Only the uploader or an admin can delete this song");
        };
        songs.remove(songId);
      };
    };
  };

  public query func getSongById(songId : Nat) : async Song {
    switch (songs.get(songId)) {
      case (null) { Runtime.trap("Song does not exist") };
      case (?song) { song };
    };
  };
};
