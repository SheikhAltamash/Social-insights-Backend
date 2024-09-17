const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const Screenshot = require("./model");
const { cloudinary } = require("./cloudinary");
let number = 7498399449
const login = async () => {
  let browser;
  try {
     browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com");
console.log("Page loaded, waiting for element...");
await page.waitForSelector("._akav", { timeout: 10000 });
console.log("Element found, clicking...");
    await page.click("._akav");
console.log("Click executed");
    // await page.type(
    //   "div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.xeuugli.x2lwn1j.xozqiw3.x1oa3qoh.x12fk4p8.x1iymm2a > div > div > div > form > input",
    //   number);
    // await page.click(
    //   "div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.xeuugli.x2lwn1j.xozqiw3.xamitd3.x12fk4p8.x1hq5gj4 > button"
    // );
    // await page.waitForNavigation({
    //   waitUntil: "networkidle2",
    //   timeout: 60000,
    // });

  } catch (e) {
    console.log(e.message);
    await browser.close();
  }
};
module.exports={login}
//login();
