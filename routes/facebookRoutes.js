const express = require("express");
const router = express.Router();
const { FbUser } = require("../models/FaceBookModel");
const { extractInfo } = require("./functions/loginFacebook");
const {notifyClients}=require("./functions/helperFunction.js")
router.post("/fblogin", (req, res) => {
  const { data } = req.body;
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
 // Stores clients grouped by case_no

const clients = {}; 
router.get("/events", (req, res) => {
  const caseNo = req.query.caseNo;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!clients[caseNo]) clients[caseNo] = [];
  clients[caseNo].push(res);

  req.on("close", () => {
    clients[caseNo] = clients[caseNo].filter((client) => client !== res);
    if (clients[caseNo].length === 0) delete clients[caseNo];
  });
});



module.exports = { router};

