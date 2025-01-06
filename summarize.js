const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
async function summarizeChatData(filePath, prompt, outputDir, filename) {
  try {
    // Load chat data from the file
    let chatData = fs.readFileSync(filePath, "utf-8");
    chatData += prompt;
    const genAI = new GoogleGenerativeAI(
      "AIzaSyA3T146BOKH8clVHZeMU_Jsr3CTGeHx4KM"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(chatData);
    const outputTxtPath = path.join(outputDir, `${filename}.txt`);
    fs.writeFileSync(outputTxtPath, result, "utf8");
    console.log(
      `Summarized chat report file saved for chat ${filename} at: ${outputTxtPath}`
    );
    
  } catch (error) {
    console.error("Error summarizing chat data:", error);
  }

}
module.exports = summarizeChatData;
