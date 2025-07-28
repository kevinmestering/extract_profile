# 1) Base on Node 18 slim
FROM node:18-bullseye-slim

# 2) Install Firefox + dependencies
RUN apt-get update && apt-get install -y \
    firefox-esr \
    libgtk-3-0 \
    libdbus-glib-1-2 \
    libxt6 \
    libxss1 \
    libasound2 \
    libnss3 \
    libx11-xcb1 \
    libdrm2 \
    libgbm1 \
  && rm -rf /var/lib/apt/lists/*

# 3) Set working dir
WORKDIR /usr/src/app

# 4) Copy & install deps
COPY package.json package-lock.json ./
RUN npm ci --production

# 5) Copy source
COPY . .

# 6) Build your front-end (if you have one)
RUN npm run build

# 7) Expose the port your server listens on
EXPOSE 5000

# 8) Start your Express server
CMD ["node", "server.js"]
