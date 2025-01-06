const express = require("express");
const app = express();
const port = 8080;
const cors = require("cors");
const mongoose = require("mongoose");
const { router } = require("./routes/facebookRoutes")
const facebookRouter = router;
app.use(express.json());
app.use(cors());
app.use(express.json());
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
mongoose
  .connect("mongodb://localhost:27017/fuzzer", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.use("/facebook", facebookRouter);

