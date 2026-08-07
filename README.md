# JAM

---

WIP: SPOTIFY JAM (But free and with more features)

## Tech Stack

- **Client**: React, TanStack Start, Tailwind CSS, Vite, Cloudflare Workers
- **Server**: Hono, Bun, YouTubei.js

## TODO

- [ ] Deploy

- [x] Core UI: header, search bar, music card, queue & player controls
- [x] Persist queue & player state in client
- [x] Fix layout and styling issues add user toast feedback, alerts
- [x] Empty, loading & error states with
- [x] Connect to room ui, and server state sync logic
- [x] Mobile responsive layout & compact player stack
- [x] seek auto trigger with locking
- [ ] Queue controls logic: play next, play again, remove, move song
- [ ] Drag & drop queue reordering

- [x] Fix: yt-dlp rate limiting
- [x] Room connection api, server room state management
- [x] Basic multiclient sync via polling
- [x] Use two diff interval for sweep, and stale
- [ ] Real time multiclient sync via WebSockets (`/jam/:roomId`)
- [ ] Host control permissions & song upvoting for rooms
- [ ] Persist active sessions (Redis)
- [ ] Cache search results & stream links on server

