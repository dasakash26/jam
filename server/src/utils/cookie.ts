export async function setupCookies() {
  if (process.env.YOUTUBE_COOKIES) {
    await Bun.write('cookie.text', process.env.YOUTUBE_COOKIES);
  }
}
