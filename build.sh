#!/bin/bash
# Update package lists
apt-get update

# Install Chromium
apt-get install -y chromium

# Install Puppeteer Chromium
npx puppeteer browsers install chrome

# Set the correct executable path
export PUPPETEER_EXECUTABLE_PATH=$(npx puppeteer browsers path chrome)

echo "Chromium installed at: $PUPPETEER_EXECUTABLE_PATH"
