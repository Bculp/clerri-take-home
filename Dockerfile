FROM node:22-alpine

RUN npm install --global pnpm@11

WORKDIR /app

# Install dependencies first so code edits don't invalidate the install layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN pnpm install --frozen-lockfile

COPY . .

# 5173 = web app, 3000 = API
EXPOSE 5173 3000

CMD ["pnpm", "dev"]
