import express from "express";
import payload from "payload";
import { initializeApp } from 'firebase/app';
import { getStorage, ref } from "firebase/storage";

require("dotenv").config();
const app = express();

// const firebaseConfig = {
//   apiKey: process.env.APIKEY,
//   authDomain: "osf-cms.firebaseapp.com",
//   projectId: "osf-cms",
//   storageBucket: "osf-cms.appspot.com",
//   messagingSenderId: process.env.MESSAGINGSENDERID,
//   appId: process.env.APPID,
//   measurementId: process.env.MEASUREMENTID,
// };

// const firebaseApp = initializeApp(firebaseConfig);
// const storage = getStorage(firebaseApp);

// Redirect root to Admin panel
app.get("/", (_, res) => {
  res.redirect("/admin");
});

// Initialize Payload
payload.init({
  secret: process.env.PAYLOAD_SECRET,
  mongoURL: process.env.MONGODB_URI,
  express: app,
  onInit: () => {
    payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
  },
});

// Add your own express routes here

app.listen(3000);
