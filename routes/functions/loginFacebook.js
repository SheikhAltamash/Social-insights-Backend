const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { FbUser } = require("../../models/FaceBookModel");
const { cloudinary } = require("../../cloudinary");
const {
  uploadScreenshot,
  scrollPage,
  sleep,
  scrollUpAndScreenshot,
} = require("./helperFunction");
let browser, page;
// let email = "9325774755";
// let password = "dw@2004";
async function extractInfo(email, password, onSuccess, data) {
  let caseNo = await FbUser.findOne({ case_no: data.case_no });
  if (caseNo) {
    onSuccess("Case number already registered", 500);
    return "Case number already registered";
  }
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
    page = await browser.newPage();
    await page.goto("https://www.facebook.com/login", {
      waitUntil: "networkidle2",
    });
    const isLoginPage = (await page.$("#email")) && (await page.$("#pass"));

    if (isLoginPage) {
      // Perform login
      await page.type("#email", email);
      await page.type("#pass", password);
      await page.click('[name="login"]');
      await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 60000,
      });
         const currentUrl = page.url();
         if (
           currentUrl.includes(
             "login_attempt=1&lwv=100" ||
               "device-based/regular"
           )
         ) {
         
           await browser.close();
           onSuccess("Login failed due to network issue", 500);
           return "Navigation failed";
         }
      const loginFailed = await page.$("#email_container > div._9ay7");

      if (loginFailed) {
        console.log("Login failed. Incorrect credentials or other issue.");
        await browser.close();
        onSuccess("Incorrect credentials", 500);
        return "Incorrect credentials";
      }
      
      let newUser = new FbUser({ case_no: data.case_no, name: data.name });
      await newUser.save();
      onSuccess("Login successful !");
      await extractUserInfo(page, data);
      await browser.close();
      return "Login successful !";
    } else {
      console.log("Already logged in, skipping login.");
      let newUser = new FbUser({ case_no: data.case_no, name: data.name });
      await newUser.save();
      onSuccess("Already logged in !");
      await extractUserInfo(page, data);
      await browser.close();
      return "Already logged in !";
    }
  } catch (error) {
    console.log(error.message);
    onSuccess("Login failed due to network issue", 500);
    if (browser) await browser.close();
  }
}

async function extractUserInfo(page, data) {
  let casenumber = data.case_no;
  try {
    console.log("Navigating to posts ");
    await page.goto("https://www.facebook.com/me/", {
      waitUntil: "networkidle2",
    });

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

        // Click on the div with the specific selector
        await page.click(
          "div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x78zum5.xdt5ytf.x1t2pt76 > div"
        );
        await page.evaluate(() => {
          const unwantedDiv1 = document.querySelector(
            "div.xds687c.x17qophe.xixxii4.x13vifvy.x1vjfegm"
          );
          if (unwantedDiv1) {
            unwantedDiv1.remove(); // Remove the element
          }
          const unwantedDiv2 = document.querySelector(
            "div.x78zum5.xdt5ytf.x1t2pt76 > div > div > div.x9f619.x1ja2u2z.x1xzczws.x7wzq59"
          );
          if (unwantedDiv2) {
            unwantedDiv2.remove(); // Remove the element
          }
          const unwantedDiv3 = document.querySelector(
            "div.xds687c.x1pi30zi.x1e558r4.xixxii4.x13vifvy.xzkaem6"
          );
          //xds687c x1pi30zi x1e558r4 xixxii4 x13vifvy xzkaem6
          if (unwantedDiv3) {
            unwantedDiv3.remove(); // Remove the element
          }
        });
        await scrollPage(page);
        while (t) {
          const p = await page.$$(
            `div.x9f619.x1n2onr6.x1ja2u2z.xeuugli.xs83m0k.xjl7jj.x1xmf6yo.x1emribx.x1e56ztr.x1i64zmx.x19h7ccj.xu9j1y6.x7ep2pv > div:nth-child(3) > div:nth-child(${postIndex}) > div`
          );

          if (!p || p.length === 0) {
            console.log("No more posts found.");
            break; // Exit the loop if no posts are found
          }

          let foundExpand = false;
          try {
            foundExpand = await page.click(
              `div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1sur9pj.xkrqix3.xzsf02u.x1s688f`
            );
          } catch (e) {
            console.log(e.message);
          }

          for (let f of p) {
            const links = await f.$$eval("a", (anchors) =>
              anchors.map((a) => a.href)
            );

            function isExternalLink(link) {
              return (
                !link.includes("www.facebook.com") || !link.includes("__cft__")
              );
            }
            const externalLinks = links.filter(isExternalLink);
            const screenshotPath = `screenshots/post_${postIndex}_${Date.now()}.png`;
            await f.screenshot({ path: screenshotPath });
            const uploadResult = await uploadScreenshot(
              screenshotPath,
              externalLinks,
              casenumber
            );
            console.log(`Uploaded post ${postIndex}:`, uploadResult);
          }
          postIndex++; // Increment after processing
        }
        await browser.close();
      } catch (e) {
        console.log(e.message);
        t = false;
      }
    }
  } catch (error) {
    console.log("Error extracting user info: ", error.message);
    await browser.close();
  }
  // //Navigate to Messages (Facebook Messenger)
  //   await page.goto("https://www.facebook.com/messages/", {
  //     waitUntil: "networkidle2",
  //   });
  //   await page.waitForSelector(
  //     "div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3.x16o0dkt.__fb-light-mode>div:nth-child(2)>div"
  //   );
  //   let friends = await page.$(
  //     "div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3.x16o0dkt.__fb-light-mode>div:nth-child(2)>div"
  // );
  // let postIndex = 1;
  // let u = true;
  // while (u) {
  //   // Dynamically building the selector using postIndex
  //   const p = await page.$(
  //     `div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3.x16o0dkt.__fb-light-mode>div:nth-child(2)>div >div:nth-child(${postIndex})`
  //   );

  //   if (!p) {
  //     // Checking if the element was found
  //     console.log("No more chats found.");
  //     break;
  //   }

  //   let foundExpand = false;
  //   try {
  //     await p.click(); // Click on the found element
  //     foundExpand = true; // If the click is successful, set flag
  //   } catch (e) {
  //     console.log(e.message); // Log any errors during the click
  //   }

  //   await sleep(2000); // Wait for 2 seconds before processing next

  //   postIndex++; // Move to the next element
  // }
}
module.exports = { extractInfo };
// extractInfo();
