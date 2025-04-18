if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { sleep } = require("./routes/functions/helperFunction");
// let email = "test_spys";
// let password = "sheikh@2004";
const { jsPDF } = require("jspdf");
const sharp = require("sharp");
const { InstaUser } = require("./models/InstaModel.js");
const { cloudinary } = require("./cloudinary.js");

async function instaLogin(email, password, onSuccess, wsInstance) {
  console.log("Logging in...");
  let browser;
  let page;
  try {
    browser = await puppeteer.launch({
      // executablePath: '/opt/render/.cache/puppeteer/chrome/linux-128.0.6613.86/chrome-linux64/chrome',
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      
    });
    page = await browser.newPage();
    await page.goto("https://www.instagram.com/", {
      waitUntil: "networkidle2",
    });

    await page.type('[aria-label="Phone number, username, or email"]', email);
    await page.type('[aria-label="Password"]', password);
    await page.click(
      " div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.xqui205.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > div:nth-child(3) > button"
    );
    try {
      await page.waitForSelector(
        "div.xkmlbd1.xvs91rp.xd4r4e8.x1anpbxc.x1m39q7l.xyorhqc.x540dpk.x2b8uid",
        { timeout: 3000 }
      );

      console.log("Incorrect creadintials");
      await browser.close();
      onSuccess("Incorrect Credentials", 500);

      return;
    } catch (e) {}

    await page.waitForNavigation({ waitUntil: "networkidle2" , timeout:60000});
    // onSuccess("Login successful !", 200);
    return { browser, page };
  } catch (e) {
    console.log(e);
    if (browser) {
      await browser.close();
    }

    return null;
  }
}
async function extractAllData(username, password, onSuccess, wsInstance, data) {
  console.log("Extracting all data");
  let loginResult;
  try {
    loginResult = await instaLogin(username, password, onSuccess, wsInstance);
  } catch (e) {
    onSuccess("Login failed", 500);
    return;
  }
  if (!loginResult) {
    wsInstance.send(JSON.stringify({ type: "crash", status: "404" }));
    return;
  }
  const { browser, page } = loginResult;
  let user = new InstaUser({ name: data.name, case_no: data.case_no });
  try {
    await extractChats(page, wsInstance, data, user, onSuccess);
    await extractPosts(page, wsInstance, user);
    await extractFollowesAndFollowings(page, wsInstance, user);
    wsInstance.send(JSON.stringify({ type: "done", status: "done" }));
  } catch (e) {
    console.log(e.message);
    wsInstance.send(JSON.stringify({ type: "crash", status: "404" }));
    await browser.close();
    return;
  }

  await browser.close();
}
async function extractFollowesAndFollowings(page, wsInstance, user) {
  try {
    wsInstance.send(
      JSON.stringify({
        type: "progress",
        status: "Analysing Followers and Followings...",
      })
    );
  } catch (e) {
    console.log(e.message);
  }
  await page.goto("https://www.instagram.com/");
  await page.waitForSelector(
    "div.x1iyjqo2.xh8yej3 > div:nth-child(8) > div > span > div > a"
  );
  await page.click(
    "div.x1iyjqo2.xh8yej3 > div:nth-child(8) > div > span > div > a"
  );
  let numberofFollowings;
  let selectorFoFollowerCount =
    "div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x17snn68.x6osk4m.x1porb0y.x8vgawa > section > main > div > header > section.xc3tme8.x18wylqe.x1xdureb.xvxrpd7.x13vxnyz > ul > li:nth-child(3) > div > a > span > span";
  let selectorFoFollowingCount =
    "div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x17snn68.x6osk4m.x1porb0y.x8vgawa > section > main > div > header > section.xc3tme8.x18wylqe.x1xdureb.xvxrpd7.x13vxnyz > ul > li:nth-child(2) > div > a > span > span";
  async function extractCouts(selector) {
    await page.waitForSelector(selector);

    // Get the element
    const element = await page.$(selector);

    if (!element) {
      console.error("Element not found with the provided selector.");
      return null;
    }

    // Extract text content using page.evaluate()
    const textContent = await page.evaluate((el) => el.textContent, element);
    return textContent;
  }

  numberOfFollowers = await extractCouts(selectorFoFollowerCount);
  numberofFollowings = await extractCouts(selectorFoFollowingCount);

  async function ScrollFolowersAndfollowings(count, page) {
    try {
      await page.click(
        "section.xc3tme8.x18wylqe.x1xdureb.xvxrpd7.x13vxnyz > ul > li:nth-child(3) > div > a"
      );
      const scrollableContainerSelector =
        "div.x7r02ix.xf1ldfh.x131esax.xdajt7p.xxfnqb6.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe > div > div > div.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6";
      const idSelector =
        "div.x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x6s0dn4.x1a02dak.x1q0g3np.xdl72j9 > div > div > div > div > div > a > div > div > span";
      const usernameSelector =
        "div.x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x6s0dn4.x1a02dak.x1q0g3np.xdl72j9 > div > div > span > span";
      const screenshots = [];

      // Wait for the main scrollable container to be present
      await page.waitForSelector(scrollableContainerSelector);

      const scrollableContainer = await page.$(scrollableContainerSelector);
      if (!scrollableContainer) {
        console.log("Scrollable container not found");
        return;
      }
      let lastHeight = await page.evaluate(
        (element) => element.scrollHeight,
        scrollableContainer
      );

      let followerCount = 0; // to determine when the follower's count reach the 'count' parameters
      let number = Math.ceil(count / 5) + 2,
        num = 1;
      console.log(number);
      while (number != 0) {
        let select = await page.waitForSelector(scrollableContainerSelector);
        const screenshotPath = `/followings_${num++}.png`;
        await select.screenshot({ path: screenshotPath });
        screenshots.push(screenshotPath);
        // Scroll the container to the bottom
        await sleep(1000);
        await page.evaluate(
          (element) => element.scrollTo(0, element.scrollHeight),
          scrollableContainer
        );
        await sleep(1000);

        const newHeight = await page.evaluate(
          (element) => element.scrollHeight,
          scrollableContainer
        );
        if (newHeight === 0) {
          console.log("Reached the end of the list or no new content loaded.");
          break;
        }
        number--;
      }
      const doc = new jsPDF();
      for (let i = screenshots.length - 1; i >= 0; i--) {
        const imageBuffer = fs.readFileSync(screenshots[i]);
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();
        const imgWidth = metadata.width;
        const imgHeight = metadata.height;

        // Set the PDF page size to match the image size
        if (i !== screenshots.length - 1) {
          doc.addPage();
        }
        doc.internal.pageSize.width = imgWidth;
        doc.internal.pageSize.height = imgHeight;

        // Add the image to the PDF
        doc.addImage(
          imageBuffer.toString("base64"),
          "JPEG",
          0,
          0,
          imgWidth,
          imgHeight
        );
      }

      // Ensure the directory exists for PDFs
      const outputDirForPdf = path.join(__dirname, "chats");
      if (!fs.existsSync(outputDirForPdf)) {
        fs.mkdirSync(outputDirForPdf, { recursive: true });
      }

      // Save the PDF with the sanitized chat name
      const outputPdfPath = path.join(outputDirForPdf, `Followings.pdf`);
      doc.save(outputPdfPath);
      console.log(`PDF saved for followings at: ${outputPdfPath}`);
      try {
        wsInstance.send(
          JSON.stringify({
            type: "progress",
            status: "Storing followers data ...",
          })
        );
      } catch (e) {
        console.log(e.message);
      }
      const uploaded = await cloudinary.uploader.upload(outputPdfPath, {
        folder: "chats",
        // resource_type: 'raw' ,
      });
      user.followers = uploaded.secure_url;
      user.save();

      fs.unlinkSync(outputPdfPath);
      console.log(`Deleted temporary file: ${outputPdfPath}`);
      // Delete all screenshots
      screenshots.forEach((screenshotPath) => {
        fs.unlinkSync(screenshotPath);
      });
    } catch (error) {
      console.error("Error during scrolling and extraction:", error.message);
      return null;
    }
  }

  await ScrollFolowersAndfollowings(numberofFollowings, page);
}
async function extractChats(page, wsInstance, data, user, onSuccess) {
  await page.goto("https://www.instagram.com/direct/inbox/", {
    waitUntil: "networkidle2",
  });
  // Check if wsInstance is valid before using it
  console.log("Extracting data from chats !");
  onSuccess("Login successful !", 200);
  if (wsInstance) {
    wsInstance.send(
      JSON.stringify({ type: "progress", status: "Fetching chats...." })
    );
  } else {
    console.log("WebSocket instance is not available.");
  }
  try {
    let selector =
      "div.x7r02ix.xf1ldfh.x131esax.xdajt7p.xxfnqb6.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe > div > div > div._a9-z > button._a9--._ap36._a9_1";
    await page.waitForSelector(selector, { timeout: 3000 });
    await page.click(selector);
  } catch (e) {
    console.log("Error clicking button:", e.message);
  }
  let ChatsPdfPath = [];
  let chatIndex = 1;
  while (true) {
    let clickChat;
    try {
      clickChat = await page.waitForSelector(
        `div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div:nth-child(2) > div > div:nth-child(${chatIndex}) > div`,
        { timeout: 3000 }
      );
      if (!clickChat) break;
    } catch (e) {
      console.log(e.message);
      break;
    }

    await page.click(
      `div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div:nth-child(2) > div > div:nth-child(${chatIndex}) > div`
    );

    await sleep(1000);
    await scrollUpAndScreenshot(
      page,
      chatIndex,
      ChatsPdfPath,
      wsInstance,
      user,
      data
    );

    chatIndex++;
  }
}
async function scrollUpAndScreenshot(
  page,
  chatIndex,
  ChatsPdfPath,
  wsInstance,
  user,
  data
) {
  const selector =
    "div.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62 > div > div > div > div > div > div";
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
  } catch (e) {
    console.log(`Chat container not found for chat ${chatIndex}:`, e.message);
    return;
  }
  // Sending chat user name
  const name =
    "div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.xsyo7zv.x16hj40l.x10b6aqq.x1yrsyyn > a > div > div > h2 ";
  let nameofChat;
  try {
    const element = await page.waitForSelector(name);
    nameofChat = await page.evaluate((el) => el.textContent, element);
  } catch (error) {
    console.error("Error extracting text:", error);
  }
  // if (
  //   nameofChat == "Kaustup Dipawale" ||
  //   nameofChat == "Rinish Gajbhiye" ||
  //   nameofChat == "@sidra_0612"
  // ) {
  //   return;
  // }

  let sendingname = "Parsing chat of  " + nameofChat;
  if (nameofChat) {
    try {
      wsInstance.send(
        JSON.stringify({
          type: "progress",
          status: sendingname,
        })
      );
    } catch (e) {
      console.log(e.message);
    }
  }
  let previousScrollTop = await page.evaluate((selector) => {
    const chatContainer = document.querySelector(selector);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return chatContainer.scrollTop;
  }, selector);

  let currentScrollTop = previousScrollTop;
  let scrollPosition = 0;
  let reachedTop = false;
  const maxIterations = 5000;
  let iterationCount = 0;
  const chatDiv = await page.$(selector);
  if (!chatDiv) {
    console.log(`Chat container not found for chat ${chatIndex}`);
    return;
  }
  const screenshots = [];
  const uniqueText = [];
  let run = true;
  let previousTextContent = ""; // Store the text of the previous scroll

  while (run) {
    // setTimeout(() => {
    //   run = false;
    // }, 10000);
    let chatNameSelector =
      "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.xl56j7k.xz9dl7a > span";
    const isChatFound = await page.evaluate((chatNameSelector) => {
      const chatElement = document.querySelector(chatNameSelector);
      return chatElement !== null;
    }, chatNameSelector);

    let chatNameSelectorBlocked =
      "div.x9f619.xpkgp8e.xmns6w2.xh8yej3 > div > span > span";
    const isChatFoundBlocked = await page.evaluate((chatNameSelectorBlocked) => {
      const chatElement = document.querySelector(chatNameSelectorBlocked);
      return chatElement !== null;
    }, chatNameSelectorBlocked);

    // Extract text from the chat container
    // await sleep(100);
    const textContent = await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      return chatContainer ? chatContainer.innerText : "";
    }, selector);
    //Check if the textContent is identical to the previous one
    if (textContent === previousTextContent) {
      //we skip screenshot generation if the content is same.
      await page.evaluate((selector) => {
        const chatContainer = document.querySelector(selector);
        chatContainer.scrollTop -= 500;
      }, selector);
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
      if (isChatFound||isChatFoundBlocked) {
        console.log("Desired chat found and moved to the top of the chat !");
        break;
      }

      continue; // Skip rest of the loop
    } else {
      previousTextContent = textContent; // Update for next check
    }
    // Add unique lines to the set with an ID
    textContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      // Regular expression to detect time and date formats
      const dateTimePattern =/\b(?:\d{1,2}:\d{2}\s?(?:AM|PM)?)|\b(?:\w+\s\d{1,2},?\s?\d{0,4})/i;

      // Skip lines that match date/time patterns
      if (
        !trimmedLine ||
        dateTimePattern.test(trimmedLine) ||
        trimmedLine.toLowerCase() === "enter"
      )
        return;

      // Send chat status after 0.5 seconds without blocking execution
      setTimeout(() => {
        wsInstance.send(
          JSON.stringify({ type: "chatStatus", status: trimmedLine })
        );
      }, 1000);

      if (
        trimmedLine &&
        !uniqueText.some((item) => item.text === trimmedLine)
      ) {
        uniqueText.unshift({ id: scrollPosition++, text: trimmedLine });
      }
    });

    const screenshotPath = `/chats/chat_${chatIndex}_scroll_${scrollPosition}.jpg`;

    await chatDiv.screenshot({
      path: screenshotPath,
      quality: 100,
    });
    screenshots.push(screenshotPath);
    await sleep(200);
    await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      chatContainer.scrollTop -= 500;
    }, selector);

    currentScrollTop = await page.evaluate((selector) => {
      const chatContainer = document.querySelector(selector);
      return chatContainer.scrollTop;
    }, selector);
    //  await sleep(200);

    if (Math.abs(currentScrollTop - previousScrollTop) < 10) {
      reachedTop = true;
    } else {
      previousScrollTop = currentScrollTop;
    }

    scrollPosition++;
    iterationCount++;
    if (isChatFound) {
      console.log("Desired chat found and moved to the top of the chat !");
      break;
    }
  }

  let chatName = await page.evaluate(() => {
    const element = document.querySelector(
      "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.xl56j7k.xz9dl7a > span"
    );
    return element ? element.textContent : "Unknown_Chat";
  });

  // Sanitize the chat name to create a valid file name
  const sanitizedChatName = chatName.replace(/[<>:"/\\|?*\n\r]/g, "_");

  // Ensure the directory exists
  const outputDir = path.join(__dirname, "chat_texts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputTxtPath = path.join(outputDir, `${sanitizedChatName}.txt`);

  // Write the array without IDs to the text file
  uniqueText.sort((a, b) => a.id - b.id);
  const textWithoutIds = uniqueText.map((item) => item.text);
  console.log(textWithoutIds.join("\n"));
  fs.writeFileSync(outputTxtPath, textWithoutIds.join("\n"), "utf8");
  console.log(
    `Text file saved for chat ${sanitizedChatName} at: ${outputTxtPath}`
  );
  const outputDirforchat = path.join(__dirname, "Analysed_Chats");
  let analysename = "Generating a report of the chat with " + nameofChat;
  try {
    wsInstance.send(
      JSON.stringify({
        type: "progress",
        status: analysename,
      })
    );
  } catch (e) {
    console.log(e.message);
  }
  await summarizeChatData(
    outputTxtPath,
    prompt,
    outputDirforchat,
    user,
    sanitizedChatName,
    wsInstance
  );
  fs.unlinkSync(outputTxtPath);
  console.log(`Deleted temporary file: ${outputTxtPath}`);

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

  // // Ensure the directory exists for PDFs
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
}
async function extractPosts(page, wsInstance, user) {
  await page.goto("https://www.instagram.com/");
  console.log("Extracting posts !");

  try {
    wsInstance.send(
      JSON.stringify({ type: "progress", status: "Analysing posts..." })
    );
  } catch (e) {
    console.log(e.message);
  }
  await page.waitForSelector(
    "div.x1iyjqo2.xh8yej3 > div:nth-child(8) > div > span > div > a"
  );
  await page.click(
    "div.x1iyjqo2.xh8yej3 > div:nth-child(8) > div > span > div > a"
  );
  console.log("clicked on Profile");
  let numberOfHorizontalDivs = 1;
  let postno = 1;
  const screenshots = [];
  //while for Each Horizontal post divs
  while (true) {
    let selectorForPostDivs = `div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x17snn68.x6osk4m.x1porb0y.x8vgawa > section > main > div > div:nth-child(3) > div > div:nth-child(${numberOfHorizontalDivs})`;
    try {
      let numberofPosts = 1;
      await page.waitForSelector(selectorForPostDivs, { timeout: 5000 });
      //While for Each post in a horzontal post div
      for (let i = 0; i < 3; i++) {
        let selectorForpost = `div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x17snn68.x6osk4m.x1porb0y.x8vgawa > section > main > div > div:nth-child(3) > div > div:nth-child(${numberOfHorizontalDivs})>div:nth-child(${numberofPosts})`;
        try {
          await page.click(selectorForpost);
          let numberofPostImages = 1;
          //While For Each Image of a Post
          await page.waitForSelector(
            "div.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe.x1qjc9v5.xjbqb8w.x1lcm9me.x1yr5g0i.xrt01vj.x10y3i5r.xr1yuqi.xkrivgy.x4ii5y1.x1gryazu.x15h9jz8.x47corl.xh8yej3.xir0mxb.x1juhsu6 > div",
            { timeout: 5000 }
          );
          const selector =
            "div.x6s0dn4.x1oozmrk.x4r51d9.xi8xln7.xl56j7k.x47corl.x10l6tqk._acvz._acnc._acng";
          const childCount = await page.evaluate((selector) => {
            const parentElement = document.querySelector(selector);
            if (parentElement) {
              return parentElement.querySelectorAll(":scope > div").length;
            } else {
              return 0;
            }
          }, selector);
          for (let i = 0; i < childCount; i++) {
            const select = await page.waitForSelector(
              "div.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe.x1qjc9v5.xjbqb8w.x1lcm9me.x1yr5g0i.xrt01vj.x10y3i5r.xr1yuqi.xkrivgy.x4ii5y1.x1gryazu.x15h9jz8.x47corl.xh8yej3.xir0mxb.x1juhsu6 > div",
              { timeout: 5000 }
            );
            await sleep(1000);
            const screenshotPath = `/posts/post_${postno}_imageNo_${numberofPostImages++}.jpg`;
            await select.screenshot({
              path: screenshotPath,
              quality: 100,
            });

            screenshots.push(screenshotPath);
            await sleep(1000);

            try {
              // await page.waitForSelector(
              //   "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x10l6tqk.x1ey2m1c.x13vifvy.x17qophe.xds687c.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > div > button._afxw._al46._al47"
              // );
              await page.click(
                "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x10l6tqk.x1ey2m1c.x13vifvy.x17qophe.xds687c.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > div > button._afxw._al46._al47"
              );
            } catch (e) {
              console.log(e.message);
              break;
            }
          }
          //Return bcack Button
          await page.click("div.x160vmok.x10l6tqk.x1eu8d0j.x1vjfegm > div");
        } catch (e) {
          console.log(e.message);
          break;
        }
        postno++;
        numberofPosts++;
      }
      numberOfHorizontalDivs++;
      console.log("one complete horizontal div is travelled");
    } catch (e) {
      console.log(e.message);
      break;
    }
  }

  // Add screenshots to PDF from bottom to top
  const doc = new jsPDF();
  for (let i = screenshots.length - 1; i >= 0; i--) {
    const imageBuffer = fs.readFileSync(screenshots[i]);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const imgWidth = metadata.width;
    const imgHeight = metadata.height;

    // Set the PDF page size to match the image size
    if (i !== screenshots.length - 1) {
      doc.addPage();
    }
    doc.internal.pageSize.width = imgWidth;
    doc.internal.pageSize.height = imgHeight;

    // Add the image to the PDF
    doc.addImage(
      imageBuffer.toString("base64"),
      "JPEG",
      0,
      0,
      imgWidth,
      imgHeight
    );
  }

  // Ensure the directory exists for PDFs
  const outputDirForPdf = path.join(__dirname, "chats");
  if (!fs.existsSync(outputDirForPdf)) {
    fs.mkdirSync(outputDirForPdf, { recursive: true });
  }

  // Save the PDF with the sanitized chat name
  const outputPdfPath = path.join(outputDirForPdf, `Posts_Instagram.pdf`);
  doc.save(outputPdfPath);
  console.log(`PDF saved for posts at: ${outputPdfPath}`);
  try {
    wsInstance.send(
      JSON.stringify({ type: "progress", status: "Storing posts data ..." })
    );
  } catch (e) {
    console.log(e.message);
  }
  const uploaded = await cloudinary.uploader.upload(outputPdfPath, {
    folder: "chats",
    // resource_type: 'raw' ,
  });
  user.posts = uploaded.secure_url;
  user.save();

  fs.unlinkSync(outputPdfPath);
  console.log(`Deleted temporary file: ${outputPdfPath}`);
  screenshots.forEach((screenshotPath) => {
    fs.unlinkSync(screenshotPath);
  });
}
async function summarizeChatData(
  filePath,
  prompt,
  outputDir,
  user,
  chatname,
  wsInstance
) {
  try {
    // Load chat data from the file
    let chatData = fs.readFileSync(filePath, "utf-8");
    // console.log(chatData);
    const combinedData = `${chatData}\n\n${prompt}`;
    const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(combinedData);
    // console.log(result.response.text());
    const outputDir = path.join(__dirname, "Analysed_Chats");
    const outputTxtPath = path.join(outputDir, "output.txt");
    fs.writeFileSync(outputTxtPath, result.response.text(), "utf8");
    console.log(
      `Summarized chat report file saved for chat one at: ${outputTxtPath}`
    );
    convertTxtToPdf(outputTxtPath, outputTxtPath);
    const uploaded = await cloudinary.uploader.upload(outputTxtPath, {
      folder: "chats",
      // resource_type: 'raw' ,
    });
    chatname = chatname.replace(" · Instagram", "");
    user.chats.push({ name: chatname, url: uploaded.secure_url });
    fs.unlinkSync(outputTxtPath);
    console.log(`Deleted temporary file: ${outputTxtPath}`);
  } catch (error) {
    console.error("Error summarizing chat data:", error);
  }
}
let prompt =
  "Analyze the following chat data and generate a structured report for a social media investigation. Identify and list all offensive words, slurs, and inappropriate language used in the conversation. Provide a detailed breakdown of all topics discussed, ensuring clarity and completeness. Extract and categorize all named entities, including people, locations, organizations, and any other identifiable entities mentioned in the chat. Clearly separate these entities into distinct sections. Identify and highlight any vague, suspicious, or coded discussions that may indicate hidden meanings, illicit activities, or deceptive communication. Analyze the chat for any direct or indirect threats, warnings, or statements suggesting harmful intent. The report must be structured into clear sections without any tables, special characters, bold text, or variations in font size. All text must remain consistent in appearance without formatting emphasis. Do not include any predefined headers, titles, dates, usernames, or subjects such as 'Social Media Investigation Report,' 'Date,' 'Subject,' 'Analysis of Instagram Post by nz.for.genz,' or any similar introductory text in the report.";

// summarizeChatData("A:/ALTAMASH A Disk/CODE/Social forensics/server/chat_texts/_kaustup_dipawale1404 · Instagram.txt", prompt);
async function convertTxtToPdf(inputTxtPath, outputPdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      const text = fs.readFileSync(inputTxtPath, "utf-8");
      const marginLeft = 10;
      const marginTop = 10;
      const pageWidth = doc.internal.pageSize.getWidth() - 20; // Account for margins
      const pageHeight = doc.internal.pageSize.getHeight() - 20;
      const lineHeight = 8;
      let yPosition = marginTop;
      const lines = doc.splitTextToSize(text, pageWidth); // Auto-wrap text
      lines.forEach((line) => {
        if (yPosition + lineHeight > pageHeight) {
          doc.addPage();
          yPosition = marginTop; // Reset Y position for new page
        }
        doc.text(line, marginLeft, yPosition);
        yPosition += lineHeight;
      });
      doc.save(outputPdfPath); // Save the full-text PDF
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { extractAllData };
