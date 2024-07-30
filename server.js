"use strict";

// server.js: This code provides a thin wrapper around an express server
// listening for http requests on port 3001

import express from "express";
import https from "https";
import fs from "fs";
import { addItem, deleteItem, getItems, startTask } from "./db.js";
import cors from "cors";
import webpush from "web-push";
import { network_addresses } from "./network_addresses.js";

const app = express();
const port = 3001;
const options = {
  // Only relevant change 7/21/2024
  //   key: fs.readFileSync("./cert/localhost-key.pem"),
  //   cert: fs.readFileSync("./cert/localhost.pem"),
  key: fs.readFileSync("./cert/localhost+1-key.pem"),
  cert: fs.readFileSync("./cert/localhost+1.pem"),
  //   key: fs.readFileSync("./cert/localhost+2-key.pem"),
  //   cert: fs.readFileSync("./cert/localhost+2.pem"),
};

Object.keys(network_addresses).map((address) => {
  console.log(network_addresses[address][0]);
});

app.use(express.json());

var localHostRegex = new RegExp(/^https:\/\/localhost(:[0-9]+)?$/);
var cors_origin_array = [localHostRegex];
Object.keys(network_addresses).map((address) => {
  cors_origin_array.push("https://" + network_addresses[address][0] + ":3000");
});

app.use(
  cors({
    origin: cors_origin_array,
    // origin: [localHostRegex, "https://192.168.1.10:3000"],
  })
);

const server = https.createServer(options, app);

const paramsDelimiter = "?params=";

/* *** Web Push Code  *** */
// cSpell:disable
const vapidKeys = {
  publicKey:
    "BExD80_HkFrtVmffpbNP-KzVCoL6Y1m7sTvP6Ai7vCGZsn-XDsjwCEbG5Hz0sE0K3_crP6-1Jqdw2a-tjHKEqHk",
  privateKey: "SNas0P12bbdAoIzM0MVkGgSouX79t2TRmYihVSpSD4Q", // this should be 32 bytes long
};
// cSpell:enable

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  "https://fcm.googleapis.com/fcm/send/cco2KhtpOvY:APA91bFz2zs2V-rF458VOEA9kwCE2S8t8vHG-u-CIO2QlaURl4aI1EAVIQBnRloED10GN4bQCXcDeynMhhhAEfgObuqqPkV_qDS99aQ91gwn4Y0hoRq_NmpYOeLUhITZiwf1vIVJxtuB",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
//function to send the notification to the subscribed device
const sendWebPush = async (subscription, dataToSend) => {
  try {
    var x = await webpush.sendNotification(subscription, dataToSend);
  } catch (err) {
    if (err.statusCode == 410) {
      /* If the express server receives a response from the push notification service */
      /* that the push notification has expired indicated by status code 410 and */
      /* body = 'push subscription has unsubscribed or expired.\n' */
      /* then it should indicate such in the database by setting the expired_dtm to the current datetime. */
      console.log("Subscription is no longer valid: ", subscription);
      deleteItem("web_push_subscription", {
        delete_type: "expired",
        capability_url: subscription.endpoint,
      });
    }
    console.log(err);
  }
};
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

  sendNotificationsAsync();

  async function sendNotificationsAsync() {
    var subscriptions = await getSubscriptionAsync();

    subscriptions.forEach((subscription) => {
      const push_subscription = {
        // capability_url in the database
        endpoint: subscription.capability_url,
        keys: {
          p256dh: subscription.public_key,
          auth: subscription.private_key,
        },
      };

      //   if (push_subscription.keys.auth == "91u78HuSRvE009UoiBSkdA")
      sendWebPush(push_subscription, JSON.stringify(req.body));
    });
  }

  async function getSubscriptionAsync() {
    return await getItems("subscriptions", `''`);
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

  async function addItemAsync(type, data) {
    try {
      await addItem(type, data);
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
