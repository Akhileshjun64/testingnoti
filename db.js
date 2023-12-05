// db.js
const mongoose = require("mongoose");

async function connectToDatabase() {
  try {
    // await mongoose.connect("mongodb://0.0.0.0:27017/testingdec");
    await mongoose.connect(
      "mongodb+srv://akhileshjun64:DQl7sqU8kpKy3QkO@testingnotidb.4xqjoqq.mongodb.net/testnotidb"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectToDatabase;
