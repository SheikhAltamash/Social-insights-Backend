
//------******THIS CODE FOR CONCURENTLY ACCESSING TWO PAGES USING


// const puppeteer = require("puppeteer");
// const { FbUser } = require("../../models/FaceBookModel");
// const { Cluster } = require("puppeteer-cluster");
// const fs = require("fs");
// const path = require("path");
// const {
//   uploadScreenshot,
//   scrollPage,
//   sleep,
//   scrollUpAndScreenshot,
// } = require("./helperFunction");

// async function extractInfo(email, password, onSuccess, dataa) {
//   try {
//     let caseNo = await FbUser.findOne({ case_no: dataa.case_no });
//     if (caseNo) {
//       onSuccess("Case number already registered", 500);
//       return "Case number already registered";
//     }

//     const userDataDir = path.join("/tmp", `user_${dataa.case_no}`);
//     const loginSuccessful = await initialLogin(
//       email,
//       password,
//       onSuccess,
//       dataa,
//       userDataDir
//     );

//     if (!loginSuccessful) {
//       onSuccess();
//       return "Login failed";
//     }

//     const cluster = await Cluster.launch({
//       concurrency: Cluster.CONCURRENCY_PAGE,
//       maxConcurrency: 2,
//       puppeteerOptions: {
//         headless: false,
//         userDataDir,timeout: 50 * 60 * 1000,
//         defaultViewport: null, // Unique directory for each user
//       },
//     });

//     await cluster.task(async ({ page, data }) => {
//       const { url, type } = data;
//       await safeGoto(page, url);
//       if (type === "message") {
//         await extractMessages(page, dataa);
//       } else if (type === "posts") {
//         await extractPosts(page, dataa);
//       }
//     });

//     await cluster.queue({
//       url: "https://www.facebook.com/messages/",
//       type: "message",
//     });
//     await cluster.queue({ url: "https://www.facebook.com/me/", type: "posts" });
//     await cluster.idle();
//     await cluster.close();
//     clearTmpDirectory(userDataDir);
//   } catch (error) {
//     console.error("Error during extractInfo operation:", error.message);
//   }
// }

// // Function for initial login to save user-specific session
// async function initialLogin(email, password, onSuccess, dataa, userDataDir) {
//   try {
//     const browser = await puppeteer.launch({
//       headless: false,
//       userDataDir,
//       defaultViewport: null, // Use unique directory for each user
//     });
//     const page = await browser.newPage();
//     await safeGoto(page, "https://www.facebook.com/login");

//     const isLoginPage = (await page.$("#email")) && (await page.$("#pass"));
//     if (isLoginPage) {
//       await page.type("#email", email);
//       await page.type("#pass", password);
//       await page.click('[name="login"]');
//       await page.waitForNavigation({
//         waitUntil: "networkidle2",
//         timeout: 60000,
//       });

//       const currentUrl = page.url();
//       if (
//         currentUrl.includes("login_attempt=1") ||
//         currentUrl.includes("device-based/regular")
//       ) {
//         onSuccess("Login failed due to network issue", 500);
//         await browser.close();
//         return false;
//       }

//       const loginFailed = await page.$("#email_container > div._9ay7");
//       if (loginFailed) {
//         onSuccess("Incorrect credentials", 500);
//         await browser.close();
//         return false;
//       }

//       let newUser = new FbUser({ case_no: dataa.case_no, name: dataa.name });
//       await newUser.save();
//       onSuccess("Login successful !");
//     } else {
//       onSuccess("Already logged in !");
//     }

//     await browser.close(); // Close browser after saving session
//     return true;
//   } catch (error) {
//     console.error("Error during initial login:", error.message);
//     onSuccess("Login failed due to error", 500);
//     return false;
//   }
// }

// // Safe navigation with retry logic
// async function safeGoto(
//   page,
//   url,
//   options = { waitUntil: "networkidle0", timeout: 90000 }
// ) {
//   try {
//     await page.goto(url, options);
//   } catch (error) {
//     console.error("Error during navigation:", error.message);
//     if (error.message.includes("Navigating frame was detached")) {
//       console.log("Frame detached, retrying...");
//       await sleep(2000);
//       await safeGoto(page, url, options);
//     } else {
//       throw error;
//     }
//   }
// }

// // Function to clear user data directory
// function clearTmpDirectory(userDataDir) {
//   fs.rm(userDataDir, { recursive: true, force: true }, (err) => {
//     if (err) {
//       console.error("Error deleting user data directory:", err);
//     } else {
//       console.log("User data directory deleted successfully.");
//     }
//   });
// }

// // Functions to extract posts and messages
// async function extractPosts(page, data) {
//   try {
//     console.log("Navigating to posts ");
   
//     await page.waitForSelector(
//       ".x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3)"
//     );

//     const posts = await page.$$(
//       ".x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3)"
//     );

//     let postIndex = 0;
//     console.log(posts.length);
//     for (let post of posts) {
//       postIndex++;
//       let t = true;
//       try {
//         await page.waitForSelector(
//           "div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x78zum5.xdt5ytf.x1t2pt76 > div",
//           { timeout: 5000 }
//         );

//         await page.click(
//           "div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x78zum5.xdt5ytf.x1t2pt76 > div"
//         );

//         await page.evaluate(() => {
//           const unwantedDiv1 = document.querySelector(
//             "div.xds687c.x17qophe.xixxii4.x13vifvy.x1vjfegm"
//           );
//           if (unwantedDiv1) unwantedDiv1.remove();

//           const unwantedDiv2 = document.querySelector(
//             "div.x78zum5.xdt5ytf.x1t2pt76 > div > div > div.x9f619.x1ja2u2z.x1xzczws.x7wzq59"
//           );
//           if (unwantedDiv2) unwantedDiv2.remove();

//           const unwantedDiv3 = document.querySelector(
//             "div.xds687c.x1pi30zi.x1e558r4.xixxii4.x13vifvy.xzkaem6"
//           );
//           if (unwantedDiv3) unwantedDiv3.remove();
//         });

//         await scrollPage(page);

//         while (t) {
//           const p = await page.$$(
//             `div.x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3) > div:nth-child(${postIndex}) > div`
//           );

//           if (!p || p.length === 0) {
//             console.log("No more posts found.");
//             break;
//           }

//           let foundExpand = false;
//           try {
//             foundExpand = await page.click(
//               `div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f`
//             );
//           } catch (e) {
//             console.log("Expand button error:", e.message);
//           }

//           for (let f of p) {
//             const links = await f.$$eval("a", (anchors) =>
//               anchors.map((a) => a.href)
//             );
//             const externalLinks = links.filter(
//               (link) =>
//                 !link.includes("www.facebook.com") || !link.includes("__cft__")
//             );
//             const screenshotPath = `screenshots/post_${postIndex}_${Date.now()}.png`;
//             await f.screenshot({ path: screenshotPath });
//             const uploadResult = await uploadScreenshot(
//               screenshotPath,
//               externalLinks,
//               data.case_no
//             );
//             console.log(`Uploaded post ${postIndex}:`, uploadResult);
//           }
//           postIndex++;
//         }
//       } catch (e) {
//         console.log("Error processing post:", e.message);
//         t = false;
//       }
//     }
//   } catch (error) {
//     console.error("Error extracting posts:", error.message);
//   }
// }

// async function extractMessages(page, data) {
//   try {
//     await page.waitForSelector(
//       "div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6"
//     );
//     let postIndex = 1;
//     let continueClicking = true;
//     while (continueClicking) {
//       const chatSelector = `div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3.x16o0dkt.__fb-light-mode>div:nth-child(2)>div >div:nth-child(${postIndex})`;
//       const chatElement = await page.$(chatSelector);
//       if (!chatElement) {
//         console.log("No more chats found.");
//         break;
//       }
//       try {
//         const selector =
//           "span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs.xxymvpz.x1dyh7pn";
//         const innerText = await page.evaluate((selector) => {
//           const element = document.querySelector(selector);
//           return element ? element.innerText : null;
//         }, selector);
//         await chatElement.click();
//         await sleep(2000);
//         await scrollUpAndScreenshot(page, postIndex, innerText);
//       } catch (e) {
//         console.log(e.message);
//       }
//       await sleep(2000);
//       postIndex++;
//     }
//   } catch (error) {
//     console.error("Error extracting messages:", error.message);
//   }
// }

// module.exports = { extractInfo };



const puppeteer = require("puppeteer");
const { FbUser } = require("../../models/FaceBookModel");
const fs = require("fs");
const path = require("path");
const {
  uploadScreenshot,
  scrollPage,
  sleep,
  scrollUpAndScreenshot,
} = require("./helperFunction");

async function extractInfo(email, password, onSuccess, dataa) {
  try {
    let caseNo = await FbUser.findOne({ case_no: dataa.case_no });
    if (caseNo) {
      onSuccess("Case number already registered", 500);
      return "Case number already registered";
    }

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    // Use a single page instance to keep the session consistent
    const page = await browser.newPage();

    const loginSuccessful = await initialLogin(
      email,
      password,
      page,
      onSuccess,
      dataa
    );

    if (!loginSuccessful) {
      await browser.close();
      onSuccess("Login failed", 500);
      return;
    }

    // Extract posts and messages sequentially to avoid concurrency issues
    await extractPosts(page, dataa);
    await extractMessages(page, dataa);

    await browser.close();
  } catch (error) {
    console.error("Error during extractInfo operation:", error.message);
  }
}

// Initial login function with session persistence
async function initialLogin(email, password, page, onSuccess, dataa) {
  try {
    await page.goto("https://www.facebook.com/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    if (await page.$("#email")) {
      await page.type("#email", email);
      await page.type("#pass", password);
      await page.click('[name="login"]');

      await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      const currentUrl = page.url();
      if (
        currentUrl.includes("login_attempt=1" || "2Fmessages" || "checkpoint")
      ) {
        onSuccess("Login failed due to network issue", 500);
        return false;
      }

      const loginFailed = await page.$("#email_container > div._9ay7");
      if (loginFailed) {
        onSuccess("Incorrect credentials", 500);
        return false;
      }

      const newUser = new FbUser({ case_no: dataa.case_no, name: dataa.name });
      await newUser.save();
      onSuccess("Login successful !");
    } else {
      onSuccess("Already logged in !");
    }
    return true;
  } catch (error) {
    console.error("Error during initial login:", error.message);
    onSuccess("Login failed due to error", 500);
    return false;
  }
}

// Function to extract posts
async function extractPosts(page, data) {
  try {
    await page.goto("https://www.facebook.com/me/", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Navigating to posts ");

        await page.waitForSelector(
          ".x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3)"
        );

        const posts = await page.$$(
          ".x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3)"
        );

        let postIndex = 0;
        console.log(posts.length);
        for (let post of posts) {
          postIndex++;
          let t = true;
          try {
            await page.waitForSelector(
              "div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x78zum5.xdt5ytf.x1t2pt76 > div",
              { timeout: 5000 }
            );

            await page.click(
              "div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x78zum5.xdt5ytf.x1t2pt76 > div"
            );

            await page.evaluate(() => {
              const unwantedDiv1 = document.querySelector(
                "div.xds687c.x17qophe.xixxii4.x13vifvy.x1vjfegm"
              );
              if (unwantedDiv1) unwantedDiv1.remove();

              const unwantedDiv2 = document.querySelector(
                "div.x78zum5.xdt5ytf.x1t2pt76 > div > div > div.x9f619.x1ja2u2z.x1xzczws.x7wzq59"
              );
              if (unwantedDiv2) unwantedDiv2.remove();

              const unwantedDiv3 = document.querySelector(
                "div.xds687c.x1pi30zi.x1e558r4.xixxii4.x13vifvy.xzkaem6"
              );
              if (unwantedDiv3) unwantedDiv3.remove();
            });

            await scrollPage(page);

            while (t) {
              const p = await page.$$(
                `div.x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3) > div:nth-child(${postIndex}) > div`
              );

              if (!p || p.length === 0) {
                console.log("No more posts found.");
                break;
              }

              let foundExpand = false;
              try {
                foundExpand = await page.click(
                  `div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f`
                );
              } catch (e) {
                console.log("Expand button error:", e.message);
              }

              for (let f of p) {
                const links = await f.$$eval("a", (anchors) =>
                  anchors.map((a) => a.href)
                );
                const externalLinks = links.filter(
                  (link) =>
                    !link.includes("www.facebook.com") || !link.includes("__cft__")
                );
                const screenshotPath = `screenshots/post_${postIndex}_${Date.now()}.png`;
                await f.screenshot({ path: screenshotPath });
                const uploadResult = await uploadScreenshot(
                  screenshotPath,
                  externalLinks,
                  data.case_no
                );
                console.log(`Uploaded post ${postIndex}:`, uploadResult);
              }
              postIndex++;
            }
          } catch (e) {
            console.log("Error processing post:", e.message);
            t = false;
          }
        }
  } catch (error) {
    console.error("Error extracting posts:", error.message);
  }
}

// Function to extract messages
async function extractMessages(page, data) {
  try {
    await page.goto("https://www.facebook.com/messages/", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    await page.waitForSelector(
      "div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6"
    );
    await page.waitForSelector(
      "div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt"    );
    let postIndex = 1;
    let continueClicking = true;
    while (continueClicking) {
      const chatSelector = `div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3.x16o0dkt.__fb-light-mode>div:nth-child(2)>div >div:nth-child(${postIndex})`;
      const chatElement = await page.$(chatSelector);
      if (!chatElement) {
        console.log("No more chats found.");
        break;
      }
      try {
        const selector =
          "span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs.xxymvpz.x1dyh7pn";
        const innerText = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return element ? element.innerText : null;
        }, selector);
        await chatElement.click();
        await sleep(2000);
        await scrollUpAndScreenshot(page, postIndex, innerText);
      } catch (e) {
        console.log(e.message);
      }
      await sleep(2000);
      postIndex++;
    }
  } catch (error) {
    console.error("Error extracting messages:", error.message);
  }
}

module.exports = { extractInfo };
