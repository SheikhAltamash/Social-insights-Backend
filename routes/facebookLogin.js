const express = require("express");
const router = express.Router();
const { FbUser } = require("../models/FaceBookModel");
const { extractInfo } = require("./functions/loginFacebook");
router.post("/fblogin", (req, res) => {
  const { data } = req.body;

  // Call Puppeteer login script and send a response based on the login result
  extractInfo(
    data.username,
    data.password,
    (loginStatus) => {
      if (
        loginStatus === "Login successful !" ||
        loginStatus === "Already logged in !"
      ) {
        res.status(200).json({ message: loginStatus });
      } else {
        res.status(500).json({ message: loginStatus });
      }
    },
    data
  );
});
router.post("/fbIndividual", async (req, res) => {
  let { case_no } = req.body; // Get case_no from query string
  let user = await FbUser.findOne({ case_no: case_no }).populate("post");
  res.send(user);
});
router.get("/fbData", async (req, res) => {
  let Data = await FbUser.find();
  let data = Data.map((user) => ({
    name: user.name,
    case_no: user.case_no,
  }));
  res.send(data);
});
let clients = [];
router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  clients.push(res);
  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});
const notifyClients = (data) => {
  // clients.forEach((client) => {
  //   client.write(`data: ${JSON.stringify(data)}\n\n`);
  console.log(data)
  // });
};
module.exports = { router, notifyClients};

