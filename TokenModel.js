// Define a schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TokenSchema = new Schema({
  token: String,
});

// Create a model
const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
