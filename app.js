const express = require("express");
const app = express();
const port = 8080;
const puppeteer = require("puppeteer");
const path = require("path");
const cors = require("cors");
const { extractInfo } = require("./loginFacebook");
const mongoose = require("mongoose");
const Screenshot = require('./model'); 
const{ login }= require("./whatsaaplogin")
app.use(express.json());
app.use(cors());
app.use(express.json());
app.listen(port, () => {console.log(`Server running at http://localhost:${port}`)});
mongoose
   .connect("mongodb://localhost:27017/fuzzer", {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));
   
app.post("/fblogin", (req, res) => {
  const { data } = req.body;

  // Call Puppeteer login script and send a response based on the login result
  extractInfo(data.username, data.password, (loginStatus) => {
    if (
      loginStatus === "Login successful" ||
      loginStatus === "Already logged in"
    ) {
      res.status(200).json({ message: loginStatus });
    } else {
      res.status(500).json({ message: loginStatus }); 
    }
  },data);
});
app.get("/fbData", async (req, res) => {
  const Data= await Screenshot.find()
  res.send(Data)
})
app.get("/whatsappQr", async(req, res) => {
  const qrData = await login();
  res.send(qrData);
});
