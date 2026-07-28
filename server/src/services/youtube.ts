export const CONFIG = {
  USER_AGENT:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  YOUTUBE_URL: "https://www.youtube.com/",
  AUDIO_FORMAT: "ba/b",
  MAX_CACHE_SIZE: 10000,
  CACHE_TTL_MS: 3600 * 1000,
  COOKIE_FILE: "cookie.text",
  YOUTUBE_ID_REGEX: /^[a-zA-Z0-9_-]{11}$/,
} as const;

let hasCookieFile = false;
Bun.file(CONFIG.COOKIE_FILE)
  .exists()
  .then((exists) => {
    hasCookieFile = exists;
  });

async function runYtDlp(args: string[]): Promise<string> {
  const flags = ["--user-agent", CONFIG.USER_AGENT, ...args];

  if (hasCookieFile) {
    flags.unshift("--cookies", CONFIG.COOKIE_FILE);
  }

  const proc = Bun.spawn(["yt-dlp", ...flags]);

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(stderr || `yt-dlp failed with exit code ${exitCode}`);
  }

  const result = stdout.trim();
  if (!result) throw new Error("yt-dlp returned an empty response.");

  return result;
}

export async function search(query: string) {
  const stdout = await runYtDlp([
    "--flat-playlist",
    "-J",
    `ytsearch10:${query + " songs only"}`,
  ]);
  try {
    return JSON.parse(stdout).entries || [];
  } catch {
    throw new Error("Failed to parse yt-dlp search output.");
  }
}

const urlCache = new Map<string, { url: string; expiresAt: number }>();

export function invalidateCache(songId: string) {
  urlCache.delete(songId);
}

export async function getStreamUrl(songId: string): Promise<string> {
  const cached = urlCache.get(songId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const url = await runYtDlp([
    "-g",
    "-f",
    CONFIG.AUDIO_FORMAT,
    `${CONFIG.YOUTUBE_URL}watch?v=${songId}`,
  ]);

  if (urlCache.size >= CONFIG.MAX_CACHE_SIZE) {
    const iterator = urlCache.keys();
    for (let i = 0; i < 100; i++) {
      const nextKey = iterator.next().value;
      if (nextKey) urlCache.delete(nextKey);
    }
  }

  urlCache.set(songId, { url, expiresAt: Date.now() + CONFIG.CACHE_TTL_MS });
  console.log("[stream] found and cached stream url", url);

  return url;
}
