const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const Screenshot = require("./model");
const { cloudinary } = require("./cloudinary");
const uploadScreenshot = async (filePath,links) => {
  try {
    console.log("sending")
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "screenshots",
    });
    console.log("Uploaded to Cloudinary:", result.secure_url);
    await saveScreenshotToDB(result.secure_url,links);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
  }
};
const saveScreenshotToDB = async (cloudinary_url, links) => {
  const validLinks = links.filter((link) => link.trim() !== "");
  try {
      const screenshot = new Screenshot({
      cloudinary_url: cloudinary_url,
      links: validLinks, // Store only valid links
    });

    await screenshot.save();
    console.log("Screenshot URL saved to MongoDB");
  } catch (error) {
    console.error("Error saving screenshot to MongoDB:", error);
  }
};

async function scrollPage(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function scrollUpAndScreenshot(page, chatIndex) {
  const selector = "div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt"; // Chat container selector

  // Initial scroll position (at the bottom)
  let previousScrollTop = await page.evaluate((selector) => {
    const chatContainer = document.querySelector(selector);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
    return chatContainer.scrollTop;
  }, selector);

  let currentScrollTop = previousScrollTop;
  let scrollPosition = 0;
  let reachedTop = false;
  const maxIterations = 50; // Set a maximum number of scrolls to avoid infinite loops
  let iterationCount = 0;

  while (!reachedTop && iterationCount < maxIterations) {
    // Take screenshot before scrolling up
    await page.screenshot({
      path: `screenshots/messages/chat_${chatIndex}_scroll_${scrollPosition}.png`,
    });

    // Scroll up a bit
    await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      chatContainer.scrollTop -= 500; // Scroll upwards
    }, selector);

    await sleep(2000); // Wait for scroll

    // Get current scroll position
    currentScrollTop = await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      return chatContainer.scrollTop;
    }, selector);

    // Exit condition: check if the current position is almost equal to previous position
    if (Math.abs(currentScrollTop - previousScrollTop) < 10) {
      reachedTop = true; // Top is reached
    } else {
      previousScrollTop = currentScrollTop; // Update scroll position
    }

    scrollPosition++;
    iterationCount++;
  }

  if (reachedTop) {
    console.log(`Reached the top of the chat ${chatIndex}`);
  } else {
    console.log(`Max iterations reached for chat ${chatIndex}, stopping.`);
  }
}

module.exports={saveScreenshotToDB,scrollPage,uploadScreenshot,sleep,scrollUpAndScreenshot}