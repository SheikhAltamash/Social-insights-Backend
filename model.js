const mongoose = require("mongoose");

// Define schema for storing Cloudinary image details
const screenshotSchema = new mongoose.Schema({
  cloudinary_url: {
    type: String,
    required: true, // Cloudinary image URL is required
  },
  post_id: {
    type: String, // Optional field to store ID of the post or message
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically stores the timestamp when the screenshot was uploaded
  },
  links: {
    type: [String],
  },
});

// Create the model from the schema
const Screenshot = mongoose.model("Screenshot", screenshotSchema);

module.exports = Screenshot;
