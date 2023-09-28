// server.js: This code provides a thin wrapper around an express server
// listening for http requests on port 3001

import express from "express";
import { addItem, deleteItem, getItems } from "./db.js";
import cors from "cors";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({ origin: "http://127.0.0.1:3000" }));

app.get("*", (req, res) => {
  console.log("Server Get Request:", "url is ", req.url, "body is", req.body);

  var operation_type = RegExp("\\w+(?=/+)", "g").exec(req.url)[0];

  switch (operation_type) {
    case "get":
      getItemsAsync();
      break;
    default:
      res.statusMessage = `Endpoint ${req.url} not supported`;
      res.sendStatus(404);
      break;
  }

  async function getItemsAsync() {
    try {
      var item_type = RegExp("(?<=/.+/).+", "g").exec(req.url)[0];

      res.json(await getItems(item_type));
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
    case "add":
      addItemAsync(req.body, item_type);
      break;
    case "delete":
      deleteItemAsync(req.body);
      break;
    default:
      res.statusMessage = `Endpoint ${req.url} not supported`;
      res.sendStatus(404);
      break;
  }

  async function addItemAsync(data) {
    try {
      await addItem(data, item_type);
      res.sendStatus(200);
    } catch (err) {
      console.log("DB Error:", err);
      res.statusMessage = err;
      res.sendStatus(404);
    }
  }

  async function deleteItemAsync(data) {
    try {
      await deleteItem(data, item_type);
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
