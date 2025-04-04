"use strict";

// server.js: This code provides a thin wrapper around an express server
// listening for https requests on the port identified by the variable, "port".
/* *** *** */
// DO NOT USE the localhost domain for anything
// It forces all the pieces, the web server, the express server and database
// and the browser to be on the same machine. It also prevents the use of a phone.
// This is not a good practice.

import express from "express";
import https from "https";
import fsSync from "fs";
import cors from "cors";
import bcrypt from "bcrypt";

import { getItems, updateItem, addItem, checkItem } from "./db.js";
import { network_addresses, environment } from "./helper_functions.js";

console.log("Environment is ", environment);

var configPath = "./config.json";
var config = JSON.parse(fsSync.readFileSync(configPath, { encoding: "utf8" }));

const app = express();

var port = config[environment].port;

var cors_origin_array = [];

// Without DNS resolution, hardcoding of the IP address of
// the machine hosting the web server is the best practice.
// You could use the hosts file on every device that needs to
// access the web server but that is even worse than hardcoding.
cors_origin_array.push(`${config.web_server_url}:${port - 1}`);

// HTTPS related code
const options = {
  key: fsSync.readFileSync(`./cert/${network_addresses["Wi-Fi"][0]}-key.pem`),
  cert: fsSync.readFileSync(`./cert/${network_addresses["Wi-Fi"][0]}.pem`),
  // Supporting multiple https domains is possible in a single certificate.
  // For example, to support 192.168.1.10, 192.168.144.1 and 172.22.112.1
  // you could build a certificate with the following command
  // *** mkcert 192.168.1.10 192.168.144.1 172.22.112.1 ***
  // and then, if you name the certificate "combined-key" you could use the
  // following code to load the certificate
  // key: fs.readFileSync(`./cert/combined-key.pem`),
  // cert: fs.readFileSync(`./cert/combined.pem`),
};

// This code is for visual feedback only.
Object.keys(network_addresses).map((address) => {
  var networkInterfaceDescription;
  if (address == "Wi-Fi") {
    networkInterfaceDescription =
      "THIS IS THE IMPORTANT NETWORK INTERFACE, THE WI-FI NETWORK INTERFACE";
  } else {
    networkInterfaceDescription = "Network interface for VM on my machine";
  }
  console.log(
    `${networkInterfaceDescription}: ${network_addresses[address][0]}`
  );
});

app.use(express.json());

// CORS related code
app.use(
  // by calling cors() with no arguments, it allows all origins
  //   cors()
  cors({
    origin: cors_origin_array,
  })
);

const server = https.createServer(options, app);

const paramsDelimiter = "?params=";

app.get("*", (req, res) => {
  console.log(`Server Get Request (${new Date()}) url: is ${req.url}`);

  if (req.url == "/data_source") {
    res.json({
      dataSource: config.database,
    });
    return;
  }
  getItemsRoute({
    item_type: req.url.substring(1, req.url.indexOf(paramsDelimiter)),
    queryParameters: JSON.parse(
      decodeURI(
        req.url.substring(
          req.url.indexOf(paramsDelimiter) + paramsDelimiter.length
        )
      )
    ),
  });

  async function getItemsRoute(params) {
    try {
      res.json(await getItems(params.item_type, params.queryParameters));
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }
});

app.post("*", (req, res) => {
  console.log("Server Post Request:", "url is ", req.url, "body is", req.body);
  var itemType;

  var exp = RegExp("\\w+(?=/*)", "g");
  // @ts-ignore
  var operationType = exp.exec(req.url)[0];
  exp = RegExp("(?<=/.+/).+", "g");
  // @ts-ignore
  itemType = exp.exec(req.url)[0];
  var payload = {
    // operation_type: operationType,
    item_type: itemType,
    data: req.body,
    origin: req.headers.origin,
  };

  switch (operationType) {
    case "add":
      addItemRoute(payload);
      break;
    case "update":
      updateItemRoute(payload);
      break;
    case "check":
      checkRoute({ item_type: itemType, data: req.body });
      break;

    case "set":
      setRoute({ item_type: itemType, data: req.body.database });
      break;

    default:
      res.statusMessage = `Endpoint ${req.url} not supported`;
      res.sendStatus(404);
      break;
  }

  async function setRoute(payload) {
    config.database = payload.data;
    fsSync.writeFileSync(configPath, JSON.stringify(config, null, 2));
    res.sendStatus(200);
  }

  async function updateItemRoute(payload) {
    try {
      await updateItem(
        payload.item_type,
        payload.data,
        payload.item_type == "thought" ? false : true
      );
      res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }

  async function addItemRoute(payload) {
    try {
      var saltRounds = 10;
      if (payload.item_type == "user_login") {
        const salt = bcrypt.genSaltSync(saltRounds);
        payload.data.hashed_password = bcrypt.hashSync(
          payload.data.password,
          salt
        );
        delete payload.data.password;
      }

      // The "domain" does not have a purpose in a production environment
      // in which only one web application is being served from the server
      // because DNS resolution will be used, not raw IP addresses;
      // however, in a development environment, especially
      // when switching between networks, with different IP addresses
      // being assigned it is helpful to have a record of the IP address
      // associated with a given service worker subscription.
      /* *** *** */
      // In a real world situation where the data server is being used
      // to support multiple web applications on different domains,
      // knowing the domain associated with web push subscriptions
      // might be helpful.
      if (payload.item_type == "web_push_subscription") {
        payload.data.domain = payload.origin;
      }

      await addItem(payload.item_type, payload.data);
      res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }

  async function checkRoute(payload) {
    try {
      /* *** Most check routes will be handled in the context of a stored procedure  *** */
      /* *** but the user_login check should be handled in the context of the server *** */
      /* *** to protect the actual password as much as possible.                     *** */
      if (payload.item_type == "user_login") {
        var storedLogin = await getItems(payload.item_type, payload.data);
        console.log("User data is: ", storedLogin);
        if (
          bcrypt.compareSync(
            payload.data.password,
            storedLogin[0].hashed_password
          )
        ) {
          delete storedLogin[0].hashed_password;
          res.json({
            success: true,
            ...storedLogin[0],
          });
        } else {
          res.json({ result: "failure" });
        }
      } else {
        var result = await checkItem(payload.item_type, payload.data);
        res.json(result[0][0]);
      }
      //   res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.json({ result: "failure" });
      //   res.sendStatus(404);
    }
  }
});

server.listen(port, () => {
  console.log(`Express server is listening on port ${port}.`);
});
