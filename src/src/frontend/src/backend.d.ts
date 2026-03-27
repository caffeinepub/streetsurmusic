import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Song {
    id: bigint;
    title: string;
    uploader: Principal;
    artist: string;
    blobReference: ExternalBlob;
    uploadedAt: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSong(songId: bigint): Promise<void>;
    getAllSongs(): Promise<Array<Song>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSongById(songId: bigint): Promise<Song>;
    getSongsByArtist(artistName: string): Promise<Array<Song>>;
    getSongsByUser(user: Principal): Promise<Array<Song>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSongs(searchText: string): Promise<Array<Song>>;
    uploadSong(metadata: {
        title: string;
        artist: string;
    }, blobReference: ExternalBlob): Promise<bigint>;
}
