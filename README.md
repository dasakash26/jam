# JAM

---

WIP: SPOTIFY JAM (But free and with more features)

## Tech Stack

- **Client**: React, TanStack Start, Tailwind CSS, Vite, Cloudflare Workers
- **Server**: Hono, Bun, YouTubei.js

## TODO

- [x] Core UI: header, search bar, music card, queue & player controls
- [ ] Persist queue & player state in client
- [ ] Queue controls logic: play next, play again, remove, move song
- [ ] Empty, loading & error states with user toast alerts
- [ ] Mobile responsive layout & compact player stack
- [ ] Drag & drop queue reordering

- [ ] Fix: yt-dlp rate limiting
- [ ] Basic multiclient sync via polling
- [ ] Real time multiclient sync via WebSockets (`/jam/:roomId`)
- [ ] Host control permissions & song upvoting for rooms
- [ ] Persist active sessions (Redis)
- [ ] Cache search results & stream links on server
