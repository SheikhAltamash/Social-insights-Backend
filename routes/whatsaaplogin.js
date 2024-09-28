const puppeteer = require("puppeteer");

const login = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com/");



    // Wait for the element to appear in the DOM
    await page.waitForSelector('div._amrn > div > span[role="button"]', {
      visible: true,
      timeout: 10000, // 10 seconds timeout
    });

    // Log the element details to make sure it's the correct one
    const elementInfo = await page.evaluate(() => {
      const element = document.querySelector(
        'div._amrn > div > span[role="button"]'
      );
      return {
        textContent: element ? element.textContent : "Not Found",
        isVisible: !!element,
        isClickable:
          element && window.getComputedStyle(element).pointerEvents !== "none",
      };
    });
    console.log("Element Info: ", elementInfo);

    if (elementInfo.isVisible && elementInfo.isClickable) {
      // Click using evaluate to force interaction inside the browser context
      await page.evaluate(() => {
        const button = document.querySelector(
          'div._amrn > div > span[role="button"]'
        );
        button.click();
      });
      console.log("Click executed via evaluate");
    } else {
      console.log("Element is not visible or clickable");
    }
  } catch (e) {
    console.log("Error: ", e.message);
  } 
};

// login();
