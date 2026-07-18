FROM oven/bun:debian AS base
WORKDIR /app

RUN apt-get update && apt-get install -y python3 curl unzip && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deno.land/install.sh | sh && \
  mv /root/.deno/bin/deno /usr/local/bin/deno

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
  chmod a+rx /usr/local/bin/yt-dlp

COPY package.json bun.lock ./
RUN bun install 

COPY . .

EXPOSE 8787
ENV PORT=8787
CMD ["bun", "src/index.ts"]

