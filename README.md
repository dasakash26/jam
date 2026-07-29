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
- [ ] Connect to room ui, and server state sync logic
- [ ] Queue controls logic: play next, play again, remove, move song
- [ ] Mobile responsive layout & compact player stack
- [ ] Drag & drop queue reordering

- [x] Fix: yt-dlp rate limiting
- [ ] Room connection api, server room state management
- [ ] Basic multiclient sync via polling
- [ ] Real time multiclient sync via WebSockets (`/jam/:roomId`)
- [ ] Host control permissions & song upvoting for rooms
- [ ] Persist active sessions (Redis)
- [ ] Cache search results & stream links on server

