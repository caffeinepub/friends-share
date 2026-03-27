# Friends Share

## Current State
New project. Only empty Motoko actor and scaffolding exist.

## Requested Changes (Diff)

### Add
- User authentication (login/signup)
- Photo sharing: upload images, display in a feed
- Message/comment system: post text messages and comment on photos
- User profiles with avatars
- Like/reaction on posts
- Friends list with online status
- Notifications for likes and comments

### Modify
- Backend actor: add full data model for posts, messages, users, comments, likes

### Remove
- Nothing (new project)

## Implementation Plan
1. Select authorization and blob-storage components
2. Generate Motoko backend with: user profiles, posts (photo + text), comments, likes, messages
3. Build React frontend: feed page, photo upload, messaging panel, notifications, user profiles
