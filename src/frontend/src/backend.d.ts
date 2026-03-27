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
export type CommentId = bigint;
export interface Comment {
    id: CommentId;
    text: string;
    author: ProfileId;
    timestamp: bigint;
}
export type MessageId = bigint;
export interface PostView {
    id: PostId;
    author: ProfileId;
    likes: Array<ProfileId>;
    timestamp: bigint;
    caption: string;
    comments: Array<CommentId>;
    photo?: ExternalBlob;
}
export interface UserProfileView {
    id: ProfileId;
    displayName: string;
    friends: Array<ProfileId>;
    avatar?: ExternalBlob;
}
export type ProfileId = Principal;
export type PostId = bigint;
export interface Message {
    id: MessageId;
    text: string;
    recipient: ProfileId;
    sender: ProfileId;
    timestamp: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: PostId, text: string): Promise<CommentId>;
    addFriend(friend: ProfileId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(caption: string, photo: ExternalBlob | null): Promise<PostId>;
    createProfile(displayName: string, avatar: ExternalBlob | null): Promise<void>;
    getAllPostsSorted(): Promise<Array<PostView>>;
    getCallerUserProfile(): Promise<UserProfileView | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: PostId): Promise<Array<Comment>>;
    getFeed(): Promise<Array<PostView>>;
    getFriends(): Promise<Array<ProfileId>>;
    getMessagesWith(recipient: ProfileId): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfileView | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    sendMessage(recipient: ProfileId, text: string): Promise<MessageId>;
    unlikePost(postId: PostId): Promise<void>;
    updateProfile(displayName: string, avatar: ExternalBlob | null): Promise<void>;
}
