# JAM TODO

## Now

- [x] Build main header, search, music card, queue, and player controls.
- [ ] Fix mobile layout for the card/queue/player stack.
- [ ] Add empty, loading, and error states for search, queue, stream failures, and playback failures.
- [ ] Replace console logs with user-visible errors or quiet debug-only logging.
- [ ] Add basic keyboard support: play/pause, next, previous, volume.
- [ ] Add tests for queue actions: add track, next track, previous track, empty queue.

## State Persistence

- [ ] Persist local player state with Zustand `persist`.
- [ ] Save `queue`, `history`, current track id, volume, repeat/shuffle mode, and last progress timestamp.
- [ ] Do not persist short-lived state like `query`, `results`, `isLoading`, and stream URLs.
- [ ] Add a state version number so old saved state can be migrated or discarded cleanly.
- [ ] Restore playback state on app load without autoplaying unexpectedly.

## Multi-Client Sync

- [ ] Introduce a shared `jamId` / room id so multiple browsers can join the same JAM session.
- [ ] Move canonical session state to the server: queue, history, current track, playback status, position, updatedAt, and controller id.
- [ ] Add WebSocket sync for real-time updates between clients.
- [ ] Broadcast state events: `queue:add`, `queue:remove`, `track:play`, `track:pause`, `track:seek`, `track:next`, `track:previous`, `volume:set`, and `client:join`.
- [ ] On client join, fetch a full session snapshot first, then subscribe to live events.
- [ ] Use server timestamps to compute playback position drift across clients.
- [ ] Decide control rules: everyone can control, host-only control, or request-to-control.
- [ ] Add reconnect handling that resyncs from the latest server snapshot.

## Server Storage

- [ ] Add session APIs: create session, get session snapshot, update queue, update playback state.
- [ ] Store active sessions in memory for local dev.
- [ ] Use durable storage for production sessions, such as Redis, Postgres, SQLite/D1, or Cloudflare Durable Objects.
- [ ] Add TTL cleanup for inactive JAM sessions.
- [ ] Cache music search results and stream metadata to reduce repeated `yt-dlp`/YouTube calls.

## Future Improvements

- [ ] Add drag-and-drop queue reordering.
- [ ] Add voting/up-next mode for shared rooms.
- [ ] Add recently played and favorites.
- [ ] Add better audio metadata: album art, uploader, duration, source, and quality.
- [ ] Add responsive compact player for small screens.
- [ ] Add accessibility pass for labels, focus states, and contrast.
- [ ] Add visual polish: smoother player transitions, queue item active state, and consistent spacing.

Welcome to your new TanStack Start app!

# Getting Started

To run this application:

```bash
bun install
bun --bun run dev
```

# Building For Production

To build this application for production:

```bash
bun --bun run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
bun --bun run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `bun install @tailwindcss/vite tailwindcss -D`

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```

## Deploy to Cloudflare Workers

This project uses the Cloudflare Vite plugin (configured in `vite.config.ts`) and `wrangler.jsonc`:

1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Deploy: `npx wrangler deploy`

For production env vars, run `wrangler secret put MY_VAR` for each secret listed in `.env.example`. Public (non-secret) vars go in `wrangler.jsonc` under `vars`.

KV, D1, R2, and Durable Object bindings are configured in `wrangler.jsonc` — see https://developers.cloudflare.com/workers/wrangler/configuration/.

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router'
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')

  useEffect(() => {
    getServerTime().then(setTime)
  }, [])

  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
