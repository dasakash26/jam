export const CONFIG = {
  USER_AGENT:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  YOUTUBE_URL: 'https://www.youtube.com/',
  AUDIO_FORMAT: 'ba/b',
  MAX_CACHE_SIZE: 200,
  CACHE_TTL_MS: 3600 * 1000,
  COOKIE_FILE: 'cookie.text',
  YOUTUBE_ID_REGEX: /^[a-zA-Z0-9_-]{11}$/,
} as const;

let hasCookieFile = false;
Bun.file(CONFIG.COOKIE_FILE)
  .exists()
  .then((exists) => {
    hasCookieFile = exists;
  });

async function runYtDlp(args: string[], timeoutMs = 30000): Promise<string> {
  const flags = [
    '--user-agent',
    CONFIG.USER_AGENT,
    '--extractor-args',
    'youtube:player_client=ios,mweb',
    ...args,
  ];

  if (hasCookieFile) {
    flags.unshift('--cookies', CONFIG.COOKIE_FILE);
  }

  const proc = Bun.spawn(['yt-dlp', ...flags]);

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`yt-dlp request timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
    proc.exited.finally(() => clearTimeout(timer));
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    Promise.race([proc.exited, timeoutPromise]),
  ]);

  if (exitCode !== 0) {
    const errText = stderr.trim();
    throw new Error(errText || `yt-dlp command execution failed with exit code ${exitCode}`);
  }

  const result = stdout.trim();
  if (!result) throw new Error('yt-dlp returned an empty response from YouTube.');

  return result;
}

export interface YtDlpEntry {
  id: string;
  title: string;
  uploader?: string;
  channel?: string;
  duration?: number;
  thumbnails?: Array<{ url: string }>;
  [key: string]: unknown;
}

export async function search(query: string): Promise<YtDlpEntry[]> {
  const cleanQuery = query.trim();

  // Direct single video URL or ID interception
  const directMatch = cleanQuery.match(/(?:v=|\/v\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (directMatch && directMatch[1]) {
    const videoId = directMatch[1];
    const stdout = await runYtDlp(['--flat-playlist', '-J', '--', `https://www.youtube.com/watch?v=${videoId}`]);
    try {
      const parsed = JSON.parse(stdout) as YtDlpEntry & { entries?: YtDlpEntry[] };
      if (parsed.entries && parsed.entries.length > 0) {
        return parsed.entries;
      }
      return parsed.id ? [parsed] : [];
    } catch {
      // Fallback to standard search if direct parsing fails
    }
  }

  const hasAudioKeyword = /\b(song|music|audio|track|remix|lyrics|official|video)\b/i.test(cleanQuery);
  const searchQuery = hasAudioKeyword ? cleanQuery : `${cleanQuery} song`;

  const stdout = await runYtDlp(['--flat-playlist', '-J', '--', `ytsearch10:${searchQuery}`]);
  try {
    const parsed = JSON.parse(stdout) as { entries?: YtDlpEntry[] };
    return parsed.entries || [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse yt-dlp search JSON output: ${message}`);
  }
}

export function extractPlaylistUrl(input: string): string {
  const listMatch = input.match(/[?&]list=([a-zA-Z0-9_-]+)/) || input.match(/^(PL[a-zA-Z0-9_-]+)$/);
  if (listMatch && listMatch[1]) {
    return `https://www.youtube.com/playlist?list=${listMatch[1]}`;
  }
  return input;
}

export async function getPlaylist(input: string): Promise<YtDlpEntry[]> {
  const targetUrl = extractPlaylistUrl(input);
  const stdout = await runYtDlp(['--flat-playlist', '--playlist-end', '100', '-J', '--', targetUrl]);
  try {
    const parsed = JSON.parse(stdout) as { entries?: YtDlpEntry[] };
    return (parsed.entries || []).filter(
      (entry) =>
        entry &&
        entry.id &&
        entry.title &&
        !entry.title.includes('[Deleted video]') &&
        !entry.title.includes('[Private video]'),
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse yt-dlp playlist JSON output: ${message}`);
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
    '-g',
    '-f',
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
  console.log('[stream] found and cached stream url', url);

  return url;
}
