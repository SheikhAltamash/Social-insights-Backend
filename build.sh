#!/usr/bin/env bash
set -o errexit  # Exit on error

# Install dependencies
npm install

# Ensure Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome
