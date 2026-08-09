# Watch room viewers list + compact controls

Date: 2026-08-09

## Goal

- Expose full participant user ids from the SignalR watch-room hub.
- Show a viewers list (nickname + avatar) to the right of the video.
- Mark owner and moderators in that list.
- Redesign the under-player control panel into a compact player-like row.

## Backend

- `PlaybackSnapshot`: replace `ParticipantCount` with `ParticipantUserIds`.
- Unique ids from `_userConnectionCounts`, ordered ascending.
- Internal `ParticipantCount` kept only for empty-room cleanup.

## Frontend

- Types / validation use `ParticipantUserIds`.
- Profiles via `UserApi.getShortUsers` (`useWatchRoomViewers`).
- Sidebar: RoomInfo + ModeratorPanel (fit) → ViewersPanel (fill).
- Controls: LIVE | viewers count; Play/Pause + time + Sync; seek under for owner/mod.
- Roles on client: owner / moderator / viewer from snapshot fields.
