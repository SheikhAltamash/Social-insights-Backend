if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");
const mongoose = require("mongoose");
const { router } = require("./routes/facebookRoutes");
const facebookRouter = router;
const { extractAllData } = require("./instagram.js");
const { WebSocketServer } = require("ws");
const { InstaUser } = require("./models/InstaModel.js");
app.use(express.json());
app.use(cors());
const server = app.listen(port, () => {
  console.log(`Server running at ${port}`);
});

const ws = new WebSocketServer({ server }); 
let wsInstance;
ws.on("connection", (ws) => {
  console.log("WebSocket client connected");
  wsInstance = ws;
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    wsInstance = null;
  });
});
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// app.use("/facebook", facebookRouter);
app.post("/InstaIndividual", async (req, res) => {
  let { case_no } = req.body; // Get case_no from query string
  let user = await InstaUser.findOne({ case_no: case_no });
  res.send(user);
});
app.get("/Instagram/AllData", async (req, res) => {
  console.log("request came from the user for all data of instagram");
  let Data = await InstaUser.find();
  let data = Data.map((user) => ({
    name: user.name,
    case_no: user.case_no,
  }));
  res.send(data);
});
app.post("/instagramlogin", async (req, res) => {
  let { data } = req.body;
  let { username, password } = data;
  let caseNo = await InstaUser.findOne({ case_no: data.case_no });
  if (caseNo) {
    res.status(500).json({ message: "Case no already exist!" });
    return "Case number already registered";
  }

  await extractAllData(
    data.username,
    data.password,
    (loginStatus, progress) => {
      if (
        loginStatus === "Login successful !" ||
        loginStatus === "Already logged in !"
      ) {
        res.status(200).json({ message: loginStatus });
      } else {
        res.status(500).json({ message: loginStatus });
      }
    },
    wsInstance,
    data
  );
});
app.get("/alive", (req, res) => {
  res.send("Server is alive");
})