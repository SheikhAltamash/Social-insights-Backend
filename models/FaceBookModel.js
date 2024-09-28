const mongoose = require("mongoose");
const screenshotSchema = new mongoose.Schema({
  cloudinary_url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  links: {
    type: [String],
  },
});
const chatSchema = new mongoose.Schema({
  friendName: String,
  links: {
    type: [String],
  },
  cloudinary_urls: {
    type:[String]
  }
})
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  case_no: {
    type: String,
    required: true,
  },
  post: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Screenshots"
  }],
  
});

const FbUser = mongoose.model("FbUsers", userSchema);
const Screenshots = mongoose.model("Screenshots",screenshotSchema) 
module.exports = { FbUser, Screenshots };
