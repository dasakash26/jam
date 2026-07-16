export async function search(query: string) {
  const proc = Bun.spawn([
    "yt-dlp",
    "--flat-playlist",
    "-J",
    `ytsearch10:${query}`,
  ]);

  const [stdout] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
  ]);

  return JSON.parse(stdout).entries;
}

export async function getStremUrl(songId: string) {
  const proc = Bun.spawn([
    "yt-dlp",
    "-g",
    "-f",
    "bestaudio",
    `https://youtu.be/${songId}`,
  ]);

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (stderr) throw new Error(stderr);

  return stdout.trim();
}
