// server.js: This code provides a thin wrapper around an express server
// listening for http requests on port 3001

import express from "express";
import { addItem, deleteItem, getItems } from "./db.js";
import cors from "cors";

const app = express();
const port = 3001;

const paramsDelimiter = "?params=";

app.use(express.json());
app.use(cors({ origin: ["http://127.0.0.1:3000", "http://127.0.0.1:3002"] }));

app.get("*", (req, res) => {
  console.log("Server Get Request: url is ", req.url);

  getItemsAsync(
    req.url.substring(1, req.url.indexOf(paramsDelimiter)),
    decodeURI(
      req.url.substring(
        req.url.indexOf(paramsDelimiter) + paramsDelimiter.length
      )
    )
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
  var exp = RegExp("\\w+(?=/+)", "g");
  var operation_type = exp.exec(req.url)[0];

  /* ***                                                                                 *** */
  // In case I want to group item types in the future this would be a way to group them.
  // In the example below we would only get a hit on add update or delete but nothing else.
  // exp = RegExp("(?<=/add/|/update/|/delete/).+", "g");
  /* ***                                                                                 *** */

  exp = RegExp("(?<=/.+/).+", "g");
  var item_type = exp.exec(req.url)[0];

  switch (operation_type) {
    case "get":
      getItemsAsync(req.body);
      break;
    case "add":
      addItemAsync(item_type, req.body);
      break;
    case "delete":
      deleteItemAsync(item_type, req.body);
      break;
    default:
      res.statusMessage = `Endpoint ${req.url} not supported`;
      res.sendStatus(404);
      break;
  }

  async function getItemsAsync(data) {
    try {
      var item_type = RegExp("(?<=/.+/).+", "g").exec(req.url)[0];

      res.json(await getItems(item_type, data));
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

app.listen(port, () =>
  console.log(`Express server is listening on port ${port}.`)
);
