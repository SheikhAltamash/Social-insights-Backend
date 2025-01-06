const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const email = "9325774755";
const password = "dw@2004";

const extractInfo = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      userDataDir: "./tmp",
    });
    const page = await browser.newPage();

    await page.goto("https://www.facebook.com/login"),
      { waitUntil: "networkidle2" };

    const isLoginPage = (await page.$("#email")) && (await page.$("#pass"));

    if (isLoginPage) {
      // Log in using provided credentials
      await page.type("#email", email);
      await page.type("#pass", password);
      await page.click('[name="login"]');
      console.log(" Successfully Login to Facebook Navigatng to Home Page ");
      // Wait for navigation after login
      await page.waitForNavigation();
    } else {
      console.log("Already logged in, skipping login.");
    }

    await extractUserInfo(page);
  } catch (error) {
    console.log(error.message);
  }
};
async function scrollPage(page) {
  // Scroll the page down
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // Scroll by 100px increments
      const timer = setInterval(() => {
        window.scrollBy(0, distance); // Scroll the window
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // Delay between each scroll step
    });
  });
}
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function extractUserInfo(page) {
  //   // await new Promise((resolve) => setTimeout(resolve, 5000));
  //   console.log("Navigating to posts ");
  //   await page.goto("https://www.facebook.com/me/", {
  //     waitUntil: "networkidle2",
  //   });
  //   await page.waitForSelector(
  //     "div.x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3)"
  //   );
  //   const posts = await page.$$(
  //     "div.x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3)"
  //   );
  //   for (let post of posts) {
  //     await scrollPage(page);
  //     await post.screenshot({ path: "screenshots/posts.png" });
  //   }

  //Navigate to Messages (Facebook Messenger)

  await page.goto("https://www.facebook.com/messages/", {
    waitUntil: "networkidle2",
  });
  await page.waitForSelector(
    ".x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3.x16o0dkt.__fb-light-mode div:nth-child(2) > div > div:nth-child(1)"
  );
  const friends = await page.$$(
    ".x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3.x16o0dkt.__fb-light-mode div:nth-child(2) > div > div:nth-child(1)"
  );
  for (let i = 0; i < friends.length; i++) {
    await friends[i].click();
    await page.waitForSelector(
      ".x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt"
    ); // Replace with the correct selector for the chat container
    await scrollUp(page, ".x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt"); // Replace with the correct selector for the chat container

    let hasReachedEnd = false;
    let scrollPosition = 0;

    while (!hasReachedEnd) {
      // Calculate the visible area of the chat
      const viewportHeight = await page.evaluate(() => window.innerHeight);

      // Take a screenshot of the visible portion
      await page.screenshot({
        path: `screenshots/chat_${i}_scroll_${scrollPosition}.png`,
        //  clip: {
        //    x: 0,
        //    y: 0,
        //    width: 800, // Adjust width to the chat's width
        //    height: viewportHeight,
        //  },
      });

      // Scroll down by one viewport height
      hasReachedEnd = await page.evaluate(
        (scrollPosition, viewportHeight) => {
          const chatContainer = document.querySelector(
            ".x78zum5.xdt5ytf.x1iyjqo2.x5yr21d"
          ); // Replace with actual selector
          chatContainer.scrollBy(0, viewportHeight);
          return (
            chatContainer.scrollHeight <=
            chatContainer.scrollTop + viewportHeight
          );
        },
        scrollPosition,
        viewportHeight
      );

      scrollPosition++;
      await sleep(2000); // Wait for 2 seconds before the next scroll
    }

    console.log(`Screenshots taken for chat ${i}`);
    await sleep(2000); // Small delay before moving to the next friend
  }
}
async function scrollUp(page, selector) {
  let previousScrollHeight = 0;
  let newScrollHeight = await page.evaluate((selector) => {
    const chatContainer = document.querySelector(selector);
    chatContainer.scrollTop = 0; // Scroll to the top
    return chatContainer.scrollHeight;
  }, selector);

  // Scroll up until there's no more new messages to load
  while (newScrollHeight > previousScrollHeight) {
    previousScrollHeight = newScrollHeight;
    await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      chatContainer.scrollTop = chatContainer.scrollTop - 500; // Scroll upwards
    }, selector);
    await sleep(2000); // Wait for the scroll to take effect

    newScrollHeight = await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      return chatContainer.scrollHeight;
    }, selector);
  }
}
//extractInfo()
//#mount_0_0_k9 > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div > div > div > div > div.x9f619.x1ja2u2z.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.xdt5ytf.x6ikm8r.x10wlt62.x1n2onr6 > div > div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1n2onr6 > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt > div







// const createScreenshot = async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     userDataDir: "./tmp",
//   });

//   const page = await browser.newPage();
//   await page.goto(
//     "https://www.flipkart.com/tyy/4io/~cs-6i0duusqlz/pr?sid=tyy%2C4io&collection-tab-name=Realme+P1+5g&param=6372&ctx=eyJjYXJkQ29udGV4dCI6eyJhdHRyaWJ1dGVzIjp7InZhbHVlQ2FsbG91dCI6eyJtdWx0aVZhbHVlZEF0dHJpYnV0ZSI6eyJrZXkiOiJ2YWx1ZUNhbGxvdXQiLCJpbmZlcmVuY2VUeXBlIjoiVkFMVUVfQ0FMTE9VVCIsInZhbHVlcyI6WyJGcm9tIOKCuTE0LDk5OSJdLCJ2YWx1ZVR5cGUiOiJNVUxUSV9WQUxVRUQifX0sInRpdGxlIjp7Im11bHRpVmFsdWVkQXR0cmlidXRlIjp7ImtleSI6InRpdGxlIiwiaW5mZXJlbmNlVHlwZSI6IlRJVExFIiwidmFsdWVzIjpbIlJlYWxtZSBQMSA1ZyJdLCJ2YWx1ZVR5cGUiOiJNVUxUSV9WQUxVRUQifX0sImhlcm9QaWQiOnsic2luZ2xlVmFsdWVBdHRyaWJ1dGUiOnsia2V5IjoiaGVyb1BpZCIsImluZmVyZW5jZVR5cGUiOiJQSUQiLCJ2YWx1ZSI6Ik1PQkdaU1U0SEg3WVpXNkQiLCJ2YWx1ZVR5cGUiOiJTSU5HTEVfVkFMVUVEIn19fX19",
//     { timeout: 120000 }
//   );

//   // Wait for the elements to be available
//   await page.waitForSelector(
//     "#container > div > div.nt6sNV.JxFEK3._48O0EI > div.DOjaWF.YJG4Cf > div:nth-child(2)"
//   );

//   const products = await page.$$(
//     "#container > div > div.nt6sNV.JxFEK3._48O0EI > div.DOjaWF.YJG4Cf > div:nth-child(2)"
//   );

//   if (products.length > 0) {

//     for (const product of products) {

//  await product.screenshot({ path: `product_.jpg` });

//         const text = await page.evaluate(
//           async (el) =>
//             el.querySelector(
//               "#container > div > div.nt6sNV.JxFEK3._48O0EI > div.DOjaWF.YJG4Cf > div:nth-child(2) > div:nth-child(3)"
//             ).textContent,
//           product
//         );
//       console.log(text);
//     }
//   } else {
//     console.log("No products found");
//   }

// //   await page.close();
// };

// const createScreenshot = async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     userDataDir: "./tmp",
//   });

//   const page = await browser.newPage();
//   await page.goto(
//     "https://www.amazon.in/boAt-Airdopes-311-Pro-Low-Latency/dp/B0CZ3ZPD8B?pd_rd_w=MeSBM&content-id=amzn1.sym.e0c8139c-1aa1-443c-af8a-145a0481f27c&pf_rd_p=e0c8139c-1aa1-443c-af8a-145a0481f27c&pf_rd_r=TWGJ5NZK5RGCZT0FTYMN&pd_rd_wg=WWBMz&pd_rd_r=79107031-006d-4e62-b3d6-69b71bf13ec2&pd_rd_i=B0CZ3ZPD8B&th=1&linkCode=sl1&tag=techum72-21&linkId=094e9c4845ce98c666739698689550da&language=en_IN&ref_=as_li_ss_tl",

//     { timeout: 120000 }
//   );

//   // Wait for the elements to be available
//   await page.waitForSelector(".a-carousel");

//   const products = await page.$$(".a-carousel");

//   if (products.length > 0) {
//     for (const product of products) {
//       await product.screenshot({ path: `product_.jpg` });
//       let data = [];
//       const text = await page.evaluate(
//         async (el) =>
//           el.querySelector(
//             "div.sponsored-products-truncator-truncated"
//           ).textContent,
//         product
//       );
//       console.log(text);
//       console.log(product)
//       console.log(products)
//     }
//   } else {
//     console.log("No products found");
//   }

//   //   await page.close();
// };

//createScreenshot();
 




























// async function scrollUpAndScreenshot(page, chatIndex, innerText) {
//   const selector =
//     "div.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.xmz0i5r.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div";
//   try {
//     await page.waitForSelector(selector, { timeout: 10000 });
//   } catch (e) {
//     console.log(`Chat container not found for chat ${chatIndex}:`, e.message);
//     return;
//   }
//   let previousScrollTop = await page.evaluate((selector) => {
//     const chatContainer = document.querySelector(selector);
//     chatContainer.scrollTop = chatContainer.scrollHeight;
//     return chatContainer.scrollTop;
//   }, selector);
//   let currentScrollTop = previousScrollTop;
//   let scrollPosition = 0;
//   let reachedTop = false;
//   const maxIterations = 5000;
//   let iterationCount = 0;
//   const chatDiv = await page.$(selector);
//   if (!chatDiv) {
//     console.log(`Chat container not found for chat ${chatIndex}`);
//     return;
//   }
//   while (!reachedTop) {
//     const chatDiv = await page.$(selector);
//     if (!chatDiv) {
//       console.log(`Chat container not found for chat ${chatIndex}`);
//       break;
//     }
//     await sleep(3000);
//     console.log("Taking screenshot...");
//     await chatDiv.screenshot({
//       //path: `../../screenshots/messages/chat_${chatIndex}_scroll_${scrollPosition}.png`,
//       path: `/chats/chat_${chatIndex}_scroll_${scrollPosition}.jpg`,
//       quality: 100,
//     });
//     // const links = await chatDiv.$$eval("a", (anchors) =>
//     //   anchors.map((a) => a.href)
//     // );
//     // console.log(links);
//     console.log("Screenshot is taken");
//     await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       chatContainer.scrollTop -= 500;
//     }, selector);
//     currentScrollTop = await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       return chatContainer.scrollTop;
//     }, selector);
//     if (Math.abs(currentScrollTop - previousScrollTop) < 10) {
//       reachedTop = true;
//     } else {
//       previousScrollTop = currentScrollTop;
//     }
//     scrollPosition++;
//     iterationCount++;
//   }
//   if (reachedTop) {
//     console.log(`Reached the top of the chat ${chatIndex}`);
//   } else {
//     console.log(`Max iterations reached for chat ${chatIndex}, stopping.`);
//   }
// }
// async function extractChats(page) {
//   // await page.click(
//   //   "div.x1iyjqo2.xh8yej3 > div:nth-child(5) > div > div > span > div > a"
//   // );
// await page.goto("https://www.instagram.com/direct/inbox/");
//   try {
//     let selector =
//       "div.x7r02ix.xf1ldfh.x131esax.xdajt7p.xxfnqb6.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe > div > div > div._a9-z > button._a9--._ap36._a9_1";
//     await page.waitForSelector(selector, { timeout: 5000 });
//     await page.click(selector);
//   } catch (e) {}

//   //--------Clicking on chats div
//   let chatIndex = 1;
//   while (true) {
//     let clickChat;
//     try {
//       clickChat = await page.waitForSelector(
//         `div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div:nth-child(2) > div > div:nth-child(${chatIndex})>div`
//       );
//       if (!clickChat) break;
//     } catch (e) {
//       console.log(e.message);
//       break;
//     }

//     await page.click(
//       `div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div:nth-child(2) > div > div:nth-child(${chatIndex})>div`
//     );

//     //Scrolling top and taking screenshots
//     await sleep(3000);

//     scrollUpAndScreenshot(page, chatIndex);
//     await sleep(3000);

//     chatIndex++;
//   }
// }
// instaLogin();

// async function screeen(page, chatIndex, innerText) {
//   const selector =
//     "div.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.xmz0i5r.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div";
//   await sleep(1000);

//   try {
//     await page.waitForSelector(selector, { timeout: 10000 });
//   } catch (e) {
//     console.log(`Chat container not found for chat ${chatIndex}:`, e.message);
//     return;
//   }

//   let previousScrollTop = await page.evaluate((selector) => {
//     const chatContainer = document.querySelector(selector);
//     chatContainer.scrollTop = chatContainer.scrollHeight;
//     return chatContainer.scrollTop;
//   }, selector);

//   let currentScrollTop = previousScrollTop;
//   let scrollPosition = 0;
//   let reachedTop = false;
//   const maxIterations = 5000;
//   let iterationCount = 0;
//   const chatDiv = await page.$(selector);
//   if (!chatDiv) {
//     console.log(`Chat container not found for chat ${chatIndex}`);
//     return;
//   }

//   const doc = new jsPDF();
//   let addedFirstImage = false;

//   while (!reachedTop) {
//     const chatDiv = await page.$(selector);
//     if (!chatDiv) {
//       console.log(`Chat container not found for chat ${chatIndex}`);
//       break;
//     }

//     const screenshotPath = `/chats/chat_${chatIndex}_scroll_${scrollPosition}.jpg`;
//     await chatDiv.screenshot({
//       path: screenshotPath,
//       quality: 100,
//     });

//     const imageData = fs.readFileSync(screenshotPath).toString("base64");

//     try {
//       if (addedFirstImage) {
//         doc.addPage();
//       }
//       doc.addImage(imageData, "JPEG", 10, 10, 190, 250); // Adjust positioning/dimensions
//       addedFirstImage = true;
//     } catch (error) {
//       console.error("Failed to add image to PDF:", error.message);
//     }

//     await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       chatContainer.scrollTop -= 500;
//     }, selector);

//     await sleep(3000);

//     currentScrollTop = await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       return chatContainer.scrollTop;
//     }, selector);

//     if (Math.abs(currentScrollTop - previousScrollTop) < 10) {
//       reachedTop = true;
//     } else {
//       previousScrollTop = currentScrollTop;
//     }

//     scrollPosition++;
//     iterationCount++;
//   }

//   if (reachedTop) {
//     console.log(`Reached the top of the chat ${chatIndex}`);
//   } else {
//     console.log(`Max iterations reached for chat ${chatIndex}, stopping.`);
//   }

//   const outputPdfPath = `/chat_${chatIndex}.pdf`;
//   doc.save(outputPdfPath);
//   console.log(`PDF saved for chat ${chatIndex} at: ${outputPdfPath}`);
// }

















// async function scrollUpAndScreenshot(page, chatIndex) {
//   const selector =
//     "div.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.xmz0i5r.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div";
//   try {
//     await page.waitForSelector(selector, { timeout: 10000 });
//   } catch (e) {
//     console.log(`Chat container not found for chat ${chatIndex}:`, e.message);
//     return;
//   }

//   let previousScrollTop = await page.evaluate((selector) => {
//     const chatContainer = document.querySelector(selector);
//     chatContainer.scrollTop = chatContainer.scrollHeight;
//     return chatContainer.scrollTop;
//   }, selector);

//   let currentScrollTop = previousScrollTop;
//   let scrollPosition = 0;
//   let reachedTop = false;
//   const maxIterations = 5000;
//   let iterationCount = 0;

//   while (!reachedTop && iterationCount < maxIterations) {
//     const chatDiv = await page.$(selector);
//     if (!chatDiv) {
//       console.log(`Chat container not found for chat ${chatIndex}`);
//       break;
//     }
//     // Check if the chat container has content
//     const hasContent = await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       return chatContainer && chatContainer.innerHTML.trim().length > 0;
//     }, selector);

//     if (!hasContent) {
//       console.log(
//         `No content found in chat ${chatIndex}, skipping screenshot.`
//       );
//       break;
//     }

//     await sleep(1000);
//     console.log("Taking screenshot...");
//     await chatDiv.screenshot({
//       path: `/chats/chat_${chatIndex}_scroll_${scrollPosition}.jpg`,
//       quality: 100,
//     });
//     console.log("Screenshot is taken");

//     await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       chatContainer.scrollTop -= 400;
//     }, selector);

//     currentScrollTop = await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       return chatContainer.scrollTop;
//     }, selector);

//     if (Math.abs(currentScrollTop - previousScrollTop) < 10) {
//       reachedTop = true;
//     } else {
//       previousScrollTop = currentScrollTop;
//     }

//     scrollPosition++;
//     iterationCount++;
//   }

//   if (reachedTop) {
//     console.log(`Reached the top of the chat ${chatIndex}`);
//   } else {
//     console.log(`Max iterations reached for chat ${chatIndex}, stopping.`);
//   }
// }
