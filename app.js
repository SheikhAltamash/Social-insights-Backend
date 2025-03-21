const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");
const mongoose = require("mongoose");
const { router } = require("./routes/facebookRoutes")
const facebookRouter = router;
const {extractAllData} = require("./instagram.js");
const { WebSocketServer } = require("ws");
app.use(express.json());
app.use(cors());
let server=app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
const ws = new WebSocketServer({ port:8081 });

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
  .connect("mongodb://localhost:27017/fuzzer", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.use("/facebook", facebookRouter);
app.post("/instagramlogin",async (req, res) => {
  let { data } = req.body;
 
 await extractAllData(

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
    }
    
  );
})




