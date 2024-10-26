const puppeteer = require("puppeteer");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const path = require("path");
const os = require("os");
const tmp = path.join(os.tmpdir(), "puppeteer_tmp");
const {
  uploadScreenshot,
  scrollPage,
  sleep,
  scrollUpAndScreenshot,
} = require("./routes/functions/helperFunction");
const { log } = require("console");
let browser;
const login = async () => {
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      userDataDir: tmp,
    });
    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com/");

    //////////////--------------------------------LOGIN CODE-----------------------------------------------------------------------------

    // await page.waitForSelector('div._amrn > div > span[role="button"]', {
    //   visible: true,
    //   timeout: 10000,
    // });
    // let bt_ph = await page.waitForSelector(
    //   'div._amrn > div > span[role="button"]',
    //   { timeout: 10000 }
    // );
    // await delay(2000)
    // await bt_ph.click('div._amrn > div > span[role="button"]');
    // let inp_enter = await page.waitForSelector(
    //   "div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.xeuugli.x2lwn1j.xozqiw3.x1oa3qoh.x12fk4p8.x1iymm2a > div > div > div > form > input"
    // );
    // await inp_enter.click();
    // await page.keyboard.press("ArrowLeft");
    // await page.keyboard.press("Backspace");
    // await page.keyboard.press("Backspace");
    // await page.type("div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.xeuugli.x2lwn1j.xozqiw3.x1oa3qoh.x12fk4p8.x1iymm2a > div > div > div > form > input","+917498399449");
    // await page.click("div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.xeuugli.x2lwn1j.xozqiw3.xamitd3.x12fk4p8.x1hq5gj4 > button");
    // const maindiv = await page.waitForSelector("div._ak96 > div > div > div", {timeout: 10000});
    // // Get all the child divs inside the main div
    // const childDivs = await maindiv.$$("div"); // Adjust this selector if necessary

    // // Loop through each child div and extract the span value
    // for (let div of childDivs) {
    //   try {
    //     // Extract the span's text content from each child div
    //     const spanText = await div.$eval("span", (span) =>
    //       span.textContent.trim()
    //     ); // Get the span content
    //     console.log(spanText); // Log the span content
    //   } catch (error) {
    //     console.error("Error extracting span text:", error); // Handle cases where there is no span
    //   }
    // }

    /////////////---------------------------------------EXTRACTION CODE----------------------------------------------------

    ExtractionScreenshot(page);
  } catch (e) {
    console.log("Error: ", e.message);
  }
};

async function ExtractionScreenshot(page) {
  try {
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    await page.waitForSelector("#pane-side", { timeout: 10000 });

    let totalChats = await page.evaluate(() => {
      const element = document.querySelector(
        "div.x1y332i5.x1n2onr6.x6ikm8r.x10wlt62"
      );
      return element
        ? parseInt(element.getAttribute("aria-rowcount"), 10)
        : 100;
    });

    console.log("Total Chats to Process:", totalChats);
    const processedChats = new Set();
    let atBottom = false;
    let scrollAmount = 20;

    while (totalChats>0) {
      for (let index = 1; index <= totalChats; index++) {
        const dynamicSelector = `#pane-side > div:nth-child(3) > div > div > div:nth-child(${index}) > div > div > div > div._ak8l > div._ak8o > div._ak8q > span`;

        const chatName = await page.evaluate((selector) => {
          const spanElement = document.querySelector(selector);
          return spanElement ? spanElement.textContent : null;
        }, dynamicSelector);

        // Only process the chat if it's not already in the set
        if (chatName && !processedChats.has(chatName)) {
          processedChats.add(chatName);
          console.log("Processing chat:", chatName);
          console.log("Current Processed Chats Set:", [...processedChats]);
          console.log(
            "Remaining chats to process:",
            totalChats - processedChats.size
          );
        }
      }

      // Delay to allow for UI to load more content


      // Scroll logic: alternate between scrolling down and up
      if (atBottom) {
        await page.evaluate(() => {
          const pane = document.querySelector("#pane-side");
          pane.scrollBy(0, -20);
        });
      } else {
        await page.evaluate(() => {
          const pane = document.querySelector("#pane-side");
          pane.scrollBy(0, 100);
        });
      }

      // Check scroll position and toggle atBottom flag
      const reachedBottom = await page.evaluate(() => {
        const pane = document.querySelector("#pane-side");
        return pane.scrollTop + pane.clientHeight >= pane.scrollHeight;
      });

      if (reachedBottom) atBottom = true;
      else if (
        await page.evaluate(
          () => document.querySelector("#pane-side").scrollTop === 0
        )
      )
        atBottom = false;
    }

    // Log final processed chats
    console.log("All unique chat names processed:", [...processedChats]);
  } catch (e) {
    console.log(e.message);
  }
}


// login();

