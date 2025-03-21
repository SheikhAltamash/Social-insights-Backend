const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { FbUser } = require("./models/FaceBookModel");
const { cloudinary } = require("./cloudinary");
const {
  uploadScreenshot,
  scrollPage,
  sleep,
  scrollUpAndScreenshot,
} = require("./routes/functions/helperFunction");
const os = require("os");
const tmp = path.join(os.tmpdir(), "puppeteer_tmp");
let browser, page;
let email = "9325774755";
let password = "dw@2004";
async function extractMessages() {
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      userDataDir: tmp,
    });
    page = await browser.newPage();
       await page.goto("https://www.facebook.com/login", {
         waitUntil: "networkidle2",
       });
          
    await Messages(page);
    await browser.close();
  } catch (error) {
    console.log(error.message);
    if (browser) await browser.close();
  }
}

async function extractPosts() {
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      userDataDir: tmp,
    });
    page = await browser.newPage();
    await Posts(page);
    await browser.close();
  } catch (error) {
    console.log(error.message);
    if (browser) await browser.close();
  }
}
async function Messages(page) { 
   
  await page.goto("https://www.facebook.com/messages/", {
    waitUntil: "networkidle2",
  });
  
  await page.waitForSelector(
    "div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6"
  );
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
      await scrollUpAndScreenshot(page, postIndex,innerText);
    } catch (e) {
      console.log(e.message);
    }
    await sleep(2000); 
    postIndex++;
  }
}
async function Posts(page) {
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
            const screenshotPath = `/post_${postIndex}.png`;
            await f.screenshot({ path: screenshotPath });
            // const uploadResult = await uploadScreenshot(
            //   screenshotPath,
            //   externalLinks,
            //   casenumber
            // );
            console.log(`Uploaded post ${postIndex}:`);
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
}

// extractMessages();
// extractPosts();
























  // async function ScrollFolowers(count, page) {
  //   try {
  //     await page.click(
  //       "section.xc3tme8.x18wylqe.x1xdureb.xvxrpd7.x13vxnyz > ul > li:nth-child(2) > div > a"
  //     );
  //     const scrollableContainerSelector =
  //       "div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.xvbhtw8.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x17snn68.x6osk4m.x1porb0y.x8vgawa > section > main > div.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6";

  //     const screenshots = [];
  //     const scrollableContainer = await page.$(scrollableContainerSelector);
  //     console.log("this is below ");
  //     if (!scrollableContainer) {
  //       console.log("Scrollable container not found");
  //       return;
  //     }

  //     let number = Math.ceil(count / 5) + 2,
  //       num = 1;
  //     console.log(number);
  //     while (number != 0) {
  //       let select = await page.waitForSelector(scrollableContainerSelector);
  //       const screenshotPath = `/followers_${num++}.png`;
  //       await select.screenshot({ path: screenshotPath });
  //       screenshots.push(screenshotPath);
  //       // Scroll the container to the bottom
  //       await sleep(500);
  //       await page.evaluate(
  //         (element) => element.scrollTo(0, element.scrollHeight),
  //         scrollableContainer
  //       );
  //       await sleep(500);

  //       const newHeight = await page.evaluate(
  //         (element) => element.scrollHeight,
  //         scrollableContainer
  //       );
  //       if (newHeight === 0) {
  //         console.log("Reached the end of the list or no new content loaded.");
  //         break;
  //       }
  //       number--;
  //     }
  //     const doc = new jsPDF();
  //     for (let i = screenshots.length - 1; i >= 0; i--) {
  //       const imageBuffer = fs.readFileSync(screenshots[i]);
  //       const image = sharp(imageBuffer);
  //       const metadata = await image.metadata();
  //       const imgWidth = metadata.width;
  //       const imgHeight = metadata.height;

  //       // Set the PDF page size to match the image size
  //       if (i !== screenshots.length - 1) {
  //         doc.addPage();
  //       }
  //       doc.internal.pageSize.width = imgWidth;
  //       doc.internal.pageSize.height = imgHeight;

  //       // Add the image to the PDF
  //       doc.addImage(
  //         imageBuffer.toString("base64"),
  //         "JPEG",
  //         0,
  //         0,
  //         imgWidth,
  //         imgHeight
  //       );
  //     }

  //     // Ensure the directory exists for PDFs
  //     const outputDirForPdf = path.join(__dirname, "chats");
  //     if (!fs.existsSync(outputDirForPdf)) {
  //       fs.mkdirSync(outputDirForPdf, { recursive: true });
  //     }

  //     // Save the PDF with the sanitized chat name
  //     const outputPdfPath = path.join(outputDirForPdf, `followers.pdf`);
  //     doc.save(outputPdfPath);
  //     console.log(`PDF saved for Followers at: ${outputPdfPath}`);

  //     // Delete all screenshots
  //     screenshots.forEach((screenshotPath) => {
  //       fs.unlinkSync(screenshotPath);
  //     });
  //   } catch (error) {
  //     console.error("Error during scrolling and extraction:", error.message);
  //     return null;
  //   }
  //   await page.click(
  //     "div.x1qjc9v5.x78zum5.xdt5ytf > div > div._ac7b._ac7d > div > button"
  //   );
  // }
// await ScrollFolowers(numberOfFollowers, page);
  











































































// await summarizeChatData(outputTxtPath,prompt,outputDir,sanitizedChatName)
  // Add screenshots to PDF from bottom to top
  // const doc = new jsPDF();
  // for (let i = screenshots.length - 1; i >= 0; i--) {
  //   const imageBuffer = fs.readFileSync(screenshots[i]);
  //   const image = sharp(imageBuffer);
  //   const metadata = await image.metadata();
  //   const imgWidth = metadata.width;
  //   const imgHeight = metadata.height;

  //   // Set the PDF page size to match the image size
  //   if (i !== screenshots.length - 1) {
  //     doc.addPage();
  //   }
  //   doc.internal.pageSize.width = imgWidth;
  //   doc.internal.pageSize.height = imgHeight;

  //   // Add the image to the PDF
  //   doc.addImage(
  //     imageBuffer.toString("base64"),
  //     "JPEG",
  //     0,
  //     0,
  //     imgWidth,
  //     imgHeight
  //   );
  // }

  // Ensure the directory exists for PDFs
  // const outputDirForPdf = path.join(__dirname, "chats");
  // if (!fs.existsSync(outputDirForPdf)) {
  //   fs.mkdirSync(outputDirForPdf, { recursive: true });
  // }

  // // Save the PDF with the sanitized chat name
  // const outputPdfPath = path.join(outputDirForPdf, `${sanitizedChatName}.pdf`);
  // doc.save(outputPdfPath);
  // console.log(`PDF saved for chat ${sanitizedChatName} at: ${outputPdfPath}`);
  // ChatsPdfPath.push({name:sanitizedChatName,path:outputPdfPath,option:"chats"});
  // // Delete all screenshots
  // screenshots.forEach((screenshotPath) => {
  //   fs.unlinkSync(screenshotPath);
// });
  





































































































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
//   const chatDiv = await page.$(selector);
//   if (!chatDiv) {
//     console.log(`Chat container not found for chat ${chatIndex}`);
//     return;
//   }
//   const screenshots = [];
//   const uniqueText = [];
//   let run = true;
//   while (run) {
//     setTimeout(() => {
//       run = false;
//     }, 10000);
//     let chatNameSelector =
//       "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.xl56j7k.xz9dl7a > span";
//     const isChatFound = await page.evaluate((chatNameSelector) => {
//       const chatElement = document.querySelector(chatNameSelector);
//       return chatElement !== null;
//     }, chatNameSelector);

//     // Extract text from the chat container
//     await sleep(100);
//     const textContent = await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       return chatContainer ? chatContainer.innerText : "";
//     }, selector);

//     // Add unique lines to the set with an ID
//     textContent.split("\n").forEach((line) => {
//       const trimmedLine = line.trim();
//       if (
//         trimmedLine &&
//         !uniqueText.some((item) => item.text === trimmedLine)
//       ) {
//         uniqueText.unshift({ id: scrollPosition++, text: trimmedLine });
//       }
//     });
//     const screenshotPath = `/chats/chat_${chatIndex}_scroll_${scrollPosition}.jpg`;

//     await chatDiv.screenshot({
//       path: screenshotPath,
//       quality: 100,
//     });
//     screenshots.push(screenshotPath);
//     // await sleep(500);
//     await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       chatContainer.scrollTop -= 500;
//     }, selector);

//     currentScrollTop = await page.evaluate((selector) => {
//       const chatContainer = document.querySelector(selector);
//       return chatContainer.scrollTop;
//     }, selector);
//     // await sleep(500);

//     if (Math.abs(currentScrollTop - previousScrollTop) < 10) {
//       reachedTop = true;
//     } else {
//       previousScrollTop = currentScrollTop;
//     }

//     scrollPosition++;
//     iterationCount++;
//     if (isChatFound) {
//       console.log("Desired chat found and moved to the top of the chat !");
//       break;
//     }
//   }

//   let chatName = await page.evaluate(() => {
//     const element = document.querySelector(
//       "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.xl56j7k.xz9dl7a > span"
//     );
//     return element ? element.textContent : "Unknown_Chat";
//   });

//   // Sanitize the chat name to create a valid file name
//   const sanitizedChatName = chatName.replace(/[<>:"/\\|?*\n\r]/g, "_");

//   // Ensure the directory exists
//   const outputDir = path.join(__dirname, "chat_texts");
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }
//   const outputTxtPath = path.join(outputDir, `${sanitizedChatName}.txt`);
//   // Write the array without IDs to the text file
//   uniqueText.sort((a, b) => a.id - b.id);
//   const textWithoutIds = uniqueText.map((item) => item.text);

//   fs.writeFileSync(outputTxtPath, textWithoutIds.join("\n"), "utf8");
//   console.log(
//     `Text file saved for chat ${sanitizedChatName} at: ${outputTxtPath}`
//   );

//   // Add screenshots to PDF from bottom to top
//   const doc = new jsPDF();
//   for (let i = screenshots.length - 1; i >= 0; i--) {
//     const imageBuffer = fs.readFileSync(screenshots[i]);
//     const image = sharp(imageBuffer);
//     const metadata = await image.metadata();
//     const imgWidth = metadata.width;
//     const imgHeight = metadata.height;

//     // Set the PDF page size to match the image size
//     if (i !== screenshots.length - 1) {
//       doc.addPage();
//     }
//     doc.internal.pageSize.width = imgWidth;
//     doc.internal.pageSize.height = imgHeight;

//     // Add the image to the PDF
//     doc.addImage(
//       imageBuffer.toString("base64"),
//       "JPEG",
//       0,
//       0,
//       imgWidth,
//       imgHeight
//     );
//   }

//   // Ensure the directory exists for PDFs
//   const outputDirForPdf = path.join(__dirname, "chats");
//   if (!fs.existsSync(outputDirForPdf)) {
//     fs.mkdirSync(outputDirForPdf, { recursive: true });
//   }

//   // Save the PDF with the sanitized chat name
//   const outputPdfPath = path.join(outputDirForPdf, `${sanitizedChatName}.pdf`);
//   doc.save(outputPdfPath);
//   console.log(`PDF saved for chat ${sanitizedChatName} at: ${outputPdfPath}`);

//   // Delete all screenshots
//   screenshots.forEach((screenshotPath) => {
//     fs.unlinkSync(screenshotPath);
//   });
// }