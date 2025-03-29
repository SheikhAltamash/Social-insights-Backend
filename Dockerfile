FROM ghcr.io/puppeteer/puppeteer:23.2.1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/opt/render/.cache/puppeteer
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node","app.js"]
