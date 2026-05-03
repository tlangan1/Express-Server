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

import { getItems, updateItem, addItem } from "./db.js";
import {
  network_addresses,
  environment,
  operating_system,
} from "./helper_functions.js";

// console.log("Environment is ", environment);

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

// TODO: simplify this operating system related code
// TODO: test this new code
// HTTPS related code
var options = {};
if (operating_system == "win32")
  options = {
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
else if (operating_system == "linux" || operating_system == "darwin")
  options = {
    key: fsSync.readFileSync(
      `./cert/${network_addresses[Object.keys(network_addresses)[0]]}-key.pem`,
    ),
    cert: fsSync.readFileSync(
      `./cert/${network_addresses[Object.keys(network_addresses)[0]]}.pem`,
    ),
  };
else {
  console.log("Unsupported operating system for HTTPS server.");
  process.exit(1);
}

// TODO: test this new code
// This code is for visual feedback only.
Object.keys(network_addresses).map((address) => {
  var networkInterfaceDescription;
  if (operating_system == "win32") {
    if (address == "Wi-Fi") {
      networkInterfaceDescription =
        "THIS IS THE IMPORTANT NETWORK INTERFACE, THE WI-FI NETWORK INTERFACE";
    } else {
      networkInterfaceDescription = "Network interface for VM on my machine";
    }
  } else if (operating_system == "linux" || operating_system == "darwin")
    networkInterfaceDescription =
      "THIS IS THE IMPORTANT NETWORK INTERFACE, THE WI-FI NETWORK INTERFACE";
  console.log(
    `${networkInterfaceDescription}: ${network_addresses[address][0]}`,
  );
});

app.use(express.json());

// CORS related code
app.use(
  // by calling cors() with no arguments, it allows all origins
  //   cors()
  cors({
    origin: cors_origin_array,
  }),
);

const server = https.createServer(options, app);

const paramsDelimiter = "?params=";

// This pattern for handling async errors in express routes is from the express documentation
// https://expressjs.com/en/guide/error-handling.html#async-error-handling
// This pattern is much more elegant than defining try-catch blocks in every route
//
// This function is defined here so that it can be used in all the routes defined in this file.
// As of 4/22/2026 it is only used in the two routes defined in this file, app.get and app.post,
// but it could be used in any future routes that need to handle async errors.
// It is a higher order function that takes an async function and returns a new function
// that wraps the async function in a try-catch block and passes any errors to the next middleware
// (the error handling middleware defined at the end of the file).
//
// This pattern is necessary because express does not catch errors thrown in async functions
// and will not pass them to the error handling middleware unless they are passed to the next function.
// Hence, the .catch(next) is only called if there is an error thrown in an async function.
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get(
  "*",
  asyncHandler(async (req, res) => {
    console.log(`Server Get Request (${new Date()}) url: is ${req.url}`);

    if (req.path == "/" || req.path == "/favicon.ico") {
      res.sendStatus(204);
      return;
    }

    var { itemType, operationType } = parseRoute(req.url);

    if (!itemType || !operationType) {
      res.status(404).json({
        error: `Endpoint ${req.url} not supported`,
      });
      return;
    }

    if (itemType == "data_source") {
      res.json({
        dataSource: environment,
      });
      return;
    }

    switch (operationType) {
      case "get_items": {
        if (!req.url.includes(paramsDelimiter)) {
          res.status(400).json({
            error: "Missing params query payload",
          });
          return;
        }

        var queryParameters;
        try {
          queryParameters = JSON.parse(decodeURI(req.query.params));
        } catch (_err) {
          res.status(400).json({
            error: "Malformed params JSON",
          });
          return;
        }

        // TODO: Protect against unsupported "get_items" routes.
        switch (itemType) {
          case "objectives":
          case "goals":
          case "tasks":
          case "task":
          // case "subscriptions":
          case "notes":
          case "thoughts":
          // case "user_login":
          case "user_logins":
          case "search":
          case "user_working_status_today":
            break;
          default:
            res.status(400).json({
              error: `Unsupported item type for get_items: ${itemType}`,
            });
            return;
        }

        var items = await getItems(itemType, queryParameters);
        res.json(items);
        return;
      }

      default:
        res.status(404).json({
          error: `Endpoint ${req.url} not supported`,
        });
        return;
    }
  }),
);

app.post(
  "*",
  asyncHandler(async (req, res) => {
    console.log(
      "Server Post Request:",
      "url is ",
      req.url,
      "body is",
      req.body,
    );
    var { itemType, operationType } = parseRoute(req.url);

    if (!itemType || !operationType) {
      res.status(404).json({
        error: `Endpoint ${req.url} not supported`,
      });
      return;
    }

    var req_payload = {
      item_type: itemType,
      data: req.body,
      origin: req.headers.origin,
    };

    function isObject(value) {
      return (
        value !== null && typeof value == "object" && !Array.isArray(value)
      );
    }

    switch (operationType) {
      case "add":
        if (!isObject(req_payload.data)) {
          res.status(400).json({
            error: "Request body must be a JSON object",
          });
          return;
        }
        if (
          req_payload.item_type == "user_login" &&
          typeof req_payload.data.password != "string"
        ) {
          res.status(400).json({
            error: "Missing required field: password",
          });
          return;
        }
        await addItemRoute(req_payload);
        res.sendStatus(200);
        return;
      case "update":
        if (!isObject(req_payload.data)) {
          res.status(400).json({
            error: "Request body must be a JSON object",
          });
          return;
        }
        // await updateItemRoute(payload);
        // res.sendStatus(200);
        const res_payload = await updateItemRoute(req_payload);
        res
          .status(200)
          .json({ success: true, returned_result_set: res_payload });
        return;
      case "check":
        if (!isObject(req.body)) {
          res.status(400).json({
            error: "Request body must be a JSON object",
          });
          return;
        }
        if (typeof req.body.password != "string") {
          res.status(400).json({
            error: "Missing required field: password",
          });
          return;
        }
        await checkRoute({ item_type: itemType, data: req.body });
        return;

      default:
        res.status(404).json({
          error: `Endpoint ${req.url} not supported`,
        });
        return;
    }

    async function setRoute(routePayload) {
      config.database = routePayload.data;
      fsSync.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    async function updateItemRoute(routePayload) {
      // await updateItem(
      return await updateItem(
        routePayload.item_type,
        routePayload.data,
        routePayload.item_type == "thought" ? false : true,
      );
    }

    async function addItemRoute(routePayload) {
      var saltRounds = 10;
      if (routePayload.item_type == "user_login") {
        const salt = bcrypt.genSaltSync(saltRounds);
        routePayload.data.hashed_password = bcrypt.hashSync(
          routePayload.data.password,
          salt,
        );
        delete routePayload.data.password;
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
      if (routePayload.item_type == "web_push_subscription") {
        routePayload.data.domain = routePayload.origin;
      }

      await addItem(routePayload.item_type, routePayload.data);
    }

    async function checkRoute(routePayload) {
      /* *** The user_login check must be handled in the context of the server       *** */
      /* *** to protect the actual password as much as possible.                     *** */
      var storedLogin = await getItems(
        routePayload.item_type,
        routePayload.data,
      );
      console.log("User data is: ", storedLogin);

      if (!storedLogin || storedLogin.length == 0) {
        res.json({ success: false });
        return;
      }

      if (
        bcrypt.compareSync(
          routePayload.data.password,
          storedLogin[0].hashed_password,
        )
      ) {
        delete storedLogin[0].hashed_password;
        res.json({
          success: true,
          ...storedLogin[0],
        });
      } else {
        res.json({ success: false });
      }
    }
  }),
);

// It is important that this error handling middleware is added after all the routes are defined.
// That is why it is at the end of the file. It will catch any errors thrown in the routes
// and send a JSON response with the error message and appropriate status code.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  var status = err.status || 500;
  if (status >= 500) {
    console.log("Server Error:", err);
  } else {
    console.log(
      `Client Error ${status}: ${req.method} ${req.url} - ${err.message}`,
    );
  }

  res.status(status).json({
    error: err.message || "Internal server error",
  });
});

server.listen(port, () => {
  console.log(`Express server is listening on port ${port}.`);
});

/* *** Helper functions *** */
function parseRoute(url) {
  if (url.includes("?")) {
    url = url.split("?")[0];
  }
  var exp = RegExp("\\w+(?=/*)", "g");
  var operationMatch = exp.exec(url);
  exp = RegExp("(?<=/.+/).+", "g");
  var itemMatch = exp.exec(url);
  var operationType = operationMatch ? operationMatch[0] : null;
  var itemType = itemMatch ? itemMatch[0] : null;
  return { operationType: operationType, itemType: itemType };
}
