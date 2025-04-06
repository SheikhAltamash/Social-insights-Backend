#!/usr/bin/env bash
set -o errexit

# Install dependencies
npm install

# Create Puppeteer cache directory
PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Chromium
npx puppeteer browsers install chrome
