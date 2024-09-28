const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { FbUser, Screenshots } = require("../../models/FaceBookModel");
const { cloudinary } = require("../../cloudinary");
const { notifyClients } = require("../facebookLogin");
const { log } = require("console");
const uploadScreenshot = async (filePath, links, casenumber) => {
  try {
    console.log("sending");
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "screenshots",
    });
    console.log("Uploaded to Cloudinary");
    const savedData = await saveScreenshotToDB(
      result.secure_url,
      links,
      casenumber
    );
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      } else {
        console.log(`File ${filePath} deleted from server`);
      }});
    console.log(notifyClients);
    notifyClients(savedData);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
  }
};
const saveScreenshotToDB = async (cloudinary_url, links, casenumber) => {
  const validLinks = links.filter((link) => link.trim() !== "");
  try {
    let user = await FbUser.findOne({ case_no: casenumber });
    let screenshot = new Screenshots({
      cloudinary_url: cloudinary_url,
      links: validLinks,
    });
    await screenshot.save();
    user.post.push(screenshot);
    await user.save();
    console.log("Screenshot URL saved to MongoDB");
    return screenshot
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

async function scrollUpAndScreenshot(page, chatIndex,innerText) {
  const selector = "div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt";
  let previousScrollTop = await page.evaluate((selector) => {
    const chatContainer = document.querySelector(selector);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return chatContainer.scrollTop;
  }, selector);
  let currentScrollTop = previousScrollTop;
  let scrollPosition = 0;
  let reachedTop = false;
  const maxIterations = 50;
  let iterationCount = 0;
  const chatDiv = await page.$(selector);
  if (!chatDiv) {
    console.log(`Chat container not found for chat ${chatIndex}`);
    return;
  }
  while (!reachedTop) {
    await chatDiv.screenshot({
      path: `../../screenshots/messages/chat_${chatIndex}_scroll_${scrollPosition}.png`,
    });
    const links = await chatDiv.$$eval("a", (anchors) => anchors.map((a) => a.href));
    console.log(links)
    await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      chatContainer.scrollTop -= 500;
    }, selector);
    await sleep(2000);
    currentScrollTop = await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      return chatContainer.scrollTop;
    }, selector);

    if (Math.abs(currentScrollTop - previousScrollTop) < 10) {
      reachedTop = true;
    } else {
      previousScrollTop = currentScrollTop;
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

module.exports = {
  saveScreenshotToDB,
  scrollPage,
  uploadScreenshot,
  sleep,
  scrollUpAndScreenshot,
};
