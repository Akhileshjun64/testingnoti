// index.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const connectToDatabase = require("./db");
const TokenModel = require("./TokenModel");
const dotenv = require("dotenv");
const adminConfig = require("./firebaseConfig");

dotenv.config();

admin.initializeApp(adminConfig);

connectToDatabase();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const SAVE_TOKEN_PATH = "/savetoken";
const SEND_NOTIFICATIONS_PATH = "/send";

app.post(SAVE_TOKEN_PATH, async (req, res, next) => {
  try {
    const { token } = req.body;

    const existingToken = await TokenModel.findOne({ token });

    if (existingToken) {
      return res.json({ message: "Token already exists in the database" });
    }

    const newToken = new TokenModel({ token });
    await newToken.save();

    res.json({ message: "Token saved to the database successfully" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(SEND_NOTIFICATIONS_PATH, async (req, res, next) => {
  try {
    const allTokens = await TokenModel.find();

    if (!allTokens || allTokens.length === 0) {
      return res.status(404).json({ error: "No tokens found in the database" });
    }

    const { title, image, body } = req.body;

    const messages = allTokens.map((tokenFromDB) => ({
      notification: { title, image, body },
      token: tokenFromDB.token,
    }));

    const sendPromises = messages.map(async (message) => {
      try {
        await admin.messaging().send(message);
        console.log("Notification sent successfully to:", message.token);
      } catch (sendError) {
        console.error("Error sending notification:", sendError);
        console.log("Failed notification details:", message);
        // Handle the specific token error here if needed
      }
    });

    await Promise.all(sendPromises);

    res.status(200).json({
      message: "Notifications sent to all tokens in the database",
      tokens: allTokens.map((token) => token.token),
    });
    console.log("Notifications sent to all tokens in the database");
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});
