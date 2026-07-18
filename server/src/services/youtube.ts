async function runYtDlp(args: string[]): Promise<string> {
  const proc = Bun.spawn(["yt-dlp", ...args]);

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(stderr || `yt-dlp failed with exit code ${exitCode}`);
  }

  return stdout.trim();
}

export async function search(query: string) {
  const stdout = await runYtDlp([
    "--flat-playlist",
    "-J",
    `ytsearch10:${query+" music"}`,
  ]);
  return JSON.parse(stdout).entries || [];
}

export async function getStreamUrl(songId: string) {
  return await runYtDlp([
    "-g",
    "-f",
    "bestaudio",
    "--extractor-args",
    "youtube:player_client=default,-tv,web_safari,web_embedded",
    `https://youtu.be/${songId}`,
  ]);
}
