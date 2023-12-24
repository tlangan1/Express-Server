// server.js: This code provides a thin wrapper around an express server
// listening for http requests on port 3001

console.log("starting");

import express from "express";
import https from "https";
import fs from "fs";
import {
  addItem,
  deleteItem,
  getItems,
  startTask,
  saveSubscription,
} from "./db.js";
import cors from "cors";
import webpush from "web-push";

const app = express();
const port = 3001;
const options = {
  key: fs.readFileSync("./cert/localhost.key"),
  cert: fs.readFileSync("./cert/localhost.crt"),
};
app.use(express.json());
app.use(cors({ origin: ["https://127.0.0.1:3000", "https://127.0.0.1:3002"] }));

const server = https.createServer(options, app);

const paramsDelimiter = "?params=";

/* *** *** */
/* *** *** */
/* *** *** */
// const vapidKeys = {
//   publicKey:
//     "BMsl9IUkXCyrRMSegobIZBQJbf2bRSmdETWKk_pL5GnhDAo1ng-wyaLZrUdtWkmFn7Er0vzmYEhjwuYhOSAGZPM",
//   privateKey: "OiMdXD6nFCfPS1d6n3cQ3A", // this should be 32 bytes long
// };
// //setting our previously generated VAPID keys
// webpush.setVapidDetails(
//   "https://fcm.googleapis.com/fcm/send/fBSt7BL-hWs:APA91bE8Emnb_D0fg31VmGXe-PYyUA8gBhyhcS4F1H0XpNtsTd-EOVMHwvChmr2Y3iM4vErkEpPP0sFG2Du9s-hcWacWnJRczHyDuZ9KrDA8sSwdmyISuZuIrAI3djpqrZOCPACll8hm",
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );
// //function to send the notification to the subscribed device
// const sendNotification = (subscription, dataToSend) => {
//   webpush.sendNotification(subscription, dataToSend);
// };
// //route to test send notification
// app.get("/send-notification", (req, res) => {
//   const subscription = dummyDb.subscription; //get subscription from your databse here.
//   const message = "Hello World";
//   sendNotification(subscription, message);
//   res.json({ message: "message sent" });
// });
/* *** *** */
/* *** *** */
/* *** *** */

app.get("*", (req, res) => {
  console.log("Server Get Request: url is ", req.url);

  getItemsAsync(
    req.url.substring(1, req.url.indexOf(paramsDelimiter)),
    `'${decodeURI(
      req.url.substring(
        req.url.indexOf(paramsDelimiter) + paramsDelimiter.length
      )
    )}'`
  );

  async function getItemsAsync(itemType, queryParameters) {
    try {
      res.json(await getItems(itemType, queryParameters));
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }
});

app.post("*", (req, res) => {
  console.log("Server Post Request:", "url is ", req.url, "body is", req.body);
  var item_type;

  var exp = RegExp("\\w+(?=/*)", "g");
  var operation_type = exp.exec(req.url)[0];

  /* ***                                                                                 *** */
  // In case I want to group item types in the future this would be a way to group them.
  // In the example below we would only get a hit on add update or delete but nothing else.
  // exp = RegExp("(?<=/add/|/update/|/delete/).+", "g");
  /* ***                                                                                 *** */

  switch (operation_type) {
    case "subscription":
      saveSubscriptionAsync(req.body);
      break;
    case "add":
      exp = RegExp("(?<=/.+/).+", "g");
      item_type = exp.exec(req.url)[0];

      addItemAsync(item_type, req.body);
      break;
    case "start":
      startTaskAsync(req.body);
      break;
    case "delete":
      exp = RegExp("(?<=/.+/).+", "g");
      item_type = exp.exec(req.url)[0];

      deleteItemAsync(item_type, req.body);
      break;
    default:
      res.statusMessage = `Endpoint ${req.url} not supported`;
      res.sendStatus(404);
      break;
  }

  async function saveSubscriptionAsync(data) {
    try {
      await saveSubscription(data);
      res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }

  var subscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cco2KhtpOvY:APA91bFz2zs2V-rF458VOEA9kwCE2S8t8vHG-u-CIO2QlaURl4aI1EAVIQBnRloED10GN4bQCXcDeynMhhhAEfgObuqqPkV_qDS99aQ91gwn4Y0hoRq_NmpYOeLUhITZiwf1vIVJxtuB",
    expirationTime: null,
  };

  async function addItemAsync(type, data) {
    try {
      await addItem(type, data);
      webpush.sendNotification(subscription, dataToSend);
      res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }

  async function startTaskAsync(data) {
    try {
      await startTask(data);
      res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }

  async function deleteItemAsync(type, data) {
    try {
      await deleteItem(type, data);
      res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }
});

server.listen(port, () =>
  console.log(`Express server is listening on port ${port}.`)
);
