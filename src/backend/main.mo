import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Blob storage
  include MixinStorage();

  // Types
  type ProfileId = Principal;
  type PostId = Nat;
  type CommentId = Nat;
  type MessageId = Nat;
  type NotificationId = Nat;
  type FriendshipId = Text;

  public type UserProfile = {
    id : ProfileId;
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    friends : Set.Set<ProfileId>;
  };

  public type UserProfileView = {
    id : ProfileId;
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    friends : [ProfileId];
  };

  public type Post = {
    id : PostId;
    author : ProfileId;
    caption : Text;
    photo : ?Storage.ExternalBlob;
    comments : List.List<CommentId>;
    likes : Set.Set<ProfileId>;
    timestamp : Int;
  };

  public type PostView = {
    id : PostId;
    author : ProfileId;
    caption : Text;
    photo : ?Storage.ExternalBlob;
    comments : [CommentId];
    likes : [ProfileId];
    timestamp : Int;
  };

  public type Comment = {
    id : CommentId;
    author : ProfileId;
    text : Text;
    timestamp : Int;
  };

  public type Message = {
    id : MessageId;
    sender : ProfileId;
    recipient : ProfileId;
    text : Text;
    timestamp : Int;
  };

  public type Notification = {
    id : NotificationId;
    recipient : ProfileId;
    notificationType : { #like; #comment; #friendRequest };
    referenceId : ?Nat;
    timestamp : Int;
  };

  // Storage
  let profiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<PostId, Post>();
  let comments = Map.empty<CommentId, Comment>();
  let messages = Map.empty<MessageId, Message>();
  let notifications = Map.empty<NotificationId, Notification>();
  let friendships = Map.empty<FriendshipId, Set.Set<ProfileId>>();

  // ID Counters
  var nextPostId = 0;
  var nextCommentId = 0;
  var nextMessageId = 0;
  var nextNotificationId = 0;

  // Conversion Functions
  func toUserProfileView(profile : UserProfile) : UserProfileView {
    {
      id = profile.id;
      displayName = profile.displayName;
      avatar = profile.avatar;
      friends = profile.friends.toArray();
    };
  };

  func toPostView(post : Post) : PostView {
    {
      id = post.id;
      author = post.author;
      caption = post.caption;
      photo = post.photo;
      comments = post.comments.toArray();
      likes = post.likes.toArray();
      timestamp = post.timestamp;
    };
  };

  // Profile Functions
  public shared ({ caller }) func createProfile(displayName : Text, avatar : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (profiles.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };

    let profile : UserProfile = {
      id = caller;
      displayName;
      avatar;
      friends = Set.empty<ProfileId>();
    };

    profiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller).map(toUserProfileView);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    // Users can view their own profile, their friends' profiles, or admins can view any
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      // Check if they are friends
      switch (profiles.get(caller)) {
        case (null) { Runtime.trap("Unauthorized: You must have a profile to view other profiles") };
        case (?callerProfile) {
          if (not callerProfile.friends.contains(user)) {
            Runtime.trap("Unauthorized: Can only view your own profile or friends' profiles");
          };
        };
      };
    };

    profiles.get(user).map(toUserProfileView);
  };

  public shared ({ caller }) func updateProfile(displayName : Text, avatar : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let existingProfile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?p) { p };
    };

    let profile : UserProfile = {
      id = caller;
      displayName;
      avatar;
      friends = existingProfile.friends;
    };
    profiles.add(caller, profile);
  };

  // Post Functions
  func isValidProfile(profileId : ProfileId) : Bool {
    profiles.containsKey(profileId);
  };

  public shared ({ caller }) func createPost(caption : Text, photo : ?Storage.ExternalBlob) : async PostId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      caption;
      photo;
      comments = List.empty<CommentId>();
      likes = Set.empty<ProfileId>();
      timestamp = Time.now();
    };
    posts.add(nextPostId, post);
    let postId = nextPostId;
    nextPostId += 1;
    postId;
  };

  module Post {
    public func compare(post1 : Post, post2 : Post) : Order.Order {
      Int.compare(post2.timestamp, post1.timestamp);
    };
  };

  public query ({ caller }) func getAllPostsSorted() : async [PostView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    posts.values().toArray().sort().map(toPostView);
  };

  public query ({ caller }) func getFeed() : async [PostView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feed");
    };

    posts.values().toArray().sort().map(toPostView);
  };

  // Likes
  func getPostInternal(postId : PostId) : Post {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };
  };

  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    let post = getPostInternal(postId);
    if (post.likes.contains(caller)) {
      Runtime.trap("Already liked");
    };
    let newLikes = post.likes.clone();
    newLikes.add(caller);
    let updatedPost : Post = {
      id = post.id;
      author = post.author;
      caption = post.caption;
      photo = post.photo;
      comments = post.comments;
      likes = newLikes;
      timestamp = post.timestamp;
    };
    posts.add(postId, updatedPost);
  };

  public shared ({ caller }) func unlikePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };
    let post = getPostInternal(postId);
    if (not post.likes.contains(caller)) {
      Runtime.trap("Not liked yet");
    };
    let newLikes = post.likes.clone();
    newLikes.remove(caller);
    let updatedPost : Post = {
      id = post.id;
      author = post.author;
      caption = post.caption;
      photo = post.photo;
      comments = post.comments;
      likes = newLikes;
      timestamp = post.timestamp;
    };
    posts.add(postId, updatedPost);
  };

  // Comment Functions
  public shared ({ caller }) func addComment(postId : PostId, text : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let comment : Comment = {
      id = nextCommentId;
      author = caller;
      text;
      timestamp = Time.now();
    };
    let post = getPostInternal(postId);
    let newComments = post.comments.clone();
    newComments.add(nextCommentId);
    let updatedPost : Post = {
      id = post.id;
      author = post.author;
      caption = post.caption;
      photo = post.photo;
      comments = newComments;
      likes = post.likes;
      timestamp = post.timestamp;
    };
    posts.add(postId, updatedPost);
    comments.add(nextCommentId, comment);
    let commentId = nextCommentId;
    nextCommentId += 1;
    commentId;
  };

  public query ({ caller }) func getComments(postId : PostId) : async [Comment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };

    let post = getPostInternal(postId);
    let commentIds = post.comments.toArray();
    commentIds.map<CommentId, Comment>(
      func(commentId) {
        switch (comments.get(commentId)) {
          case (null) {
            Runtime.trap("Comment not found");
          };
          case (?comment) { comment };
        };
      }
    );
  };

  // Messaging Functions
  public shared ({ caller }) func sendMessage(recipient : ProfileId, text : Text) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let message : Message = {
      id = nextMessageId;
      sender = caller;
      recipient;
      text;
      timestamp = Time.now();
    };
    messages.add(nextMessageId, message);
    let messageId = nextMessageId;
    nextMessageId += 1;
    messageId;
  };

  public query ({ caller }) func getMessagesWith(recipient : ProfileId) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    // Users can only see messages they sent or received
    messages.values().toArray().filter<Message>(
      func(m) {
        (m.sender == caller and m.recipient == recipient) or (m.sender == recipient and m.recipient == caller);
      }
    );
  };

  // Friend Functions
  public shared ({ caller }) func addFriend(friend : ProfileId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add friends");
    };

    if (caller == friend) {
      Runtime.trap("Cannot add yourself as a friend");
    };
    let callerProfile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("You're not registered") };
      case (?profile) { profile };
    };
    if (callerProfile.friends.contains(friend)) {
      Runtime.trap("Already friends");
    };
    let newFriends = callerProfile.friends.clone();
    newFriends.add(friend);
    let updatedProfile : UserProfile = {
      id = callerProfile.id;
      displayName = callerProfile.displayName;
      avatar = callerProfile.avatar;
      friends = newFriends;
    };
    profiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getFriends() : async [ProfileId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("You need to register before you can have friends") };
      case (?profile) { profile.friends.toArray() };
    };
  };
};
