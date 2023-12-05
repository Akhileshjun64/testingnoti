// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const admin = require("firebase-admin");
// const connectToDatabase = require("./db");
// const TokenModel = require("./TokenModel");
// const dotenv = require("dotenv");
// const serviceAccount = require("./myapp-4a647-firebase-adminsdk-x74gi-2f4b4eed19.json");

// dotenv.config();

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   projectId: "myapp-4a647",
// });

// connectToDatabase();

// const app = express();
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(cors());

// // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// app.post("/savetoken", async (req, res) => {
//   const { token } = req.body;

//   try {
//     // Check if the token already exists in the database
//     const existingToken = await TokenModel.findOne({ token });

//     if (existingToken) {
//       // If the token already exists, respond with a message
//       return res.json({ message: "Token already exists in the database" });
//     }

//     // Create a new instance of the Token model
//     const newToken = new TokenModel({ token });

//     // Save the token to the database
//     await newToken.save();

//     // Respond with a success message or any relevant response
//     res.json({ message: "Token saved to the database successfully" });
//   } catch (error) {
//     console.error("Error saving token:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// app.post("/send", async function (req, res) {
//   try {
//     // Fetch all tokens from the database
//     const allTokens = await TokenModel.find();

//     if (!allTokens || allTokens.length === 0) {
//       return res.status(404).json({ error: "No tokens found in the database" });
//     }

//     // Assuming these values are part of the request body
//     const { title, image, body } = req.body;

//     const messages = allTokens.map((tokenFromDB) => ({
//       notification: {
//         title,
//         image,
//         body,
//       },
//       token: tokenFromDB.token,
//     }));

//     // Perform additional tasks using the fetched tokens, e.g., send notifications
//     for (const message of messages) {
//       await admin.messaging().send(message);
//     }

//     res.status(200).json({
//       message: "Notifications sent to all tokens in the database",
//       tokens: allTokens.map((token) => token.token),
//     });
//     console.log("Notifications sent to all tokens in the database");
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // #####################################################

// const PORT = 4000;
// app.listen(PORT, function () {
//   console.log(`Server started on port ${PORT}`);
// });

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
    next(error);
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

    for (const message of messages) {
      await admin.messaging().send(message);
    }

    res.status(200).json({
      message: "Notifications sent to all tokens in the database",
      tokens: allTokens.map((token) => token.token),
    });
    console.log("Notifications sent to all tokens in the database");
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = 4000;
app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});
