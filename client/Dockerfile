FROM node:22-bookworm-slim
WORKDIR /app

COPY package.json bun.lock* ./

RUN npm install -g bun && bun install

COPY . .

RUN find node_modules -type f -name "workerd" -exec chmod +x {} \; || true

EXPOSE 3000

CMD ["npm", "run", "dev"]
