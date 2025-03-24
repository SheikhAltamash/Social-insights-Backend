const mongoose = require("mongoose");
// Main User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  case_no: {
    type: String,
    required: true,
    unique: true,
  },
  chats: {
    type: [
      {
        name: String, // Name of the person in chat
        url: String, // Chat message
      },
    ], // Array of chat messages
  },
  posts: {
    type: String, 
  },
  followers: {
    type: String
  }
});

// Defining Mongoose Models
const InstaUser = mongoose.model("InstaUsers", userSchema);

module.exports = { InstaUser };
