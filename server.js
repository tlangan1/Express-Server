// server.js: This code provides a thin wrapper around an express server
// listening for http requests on port 3001

import express from "express";
import { addTodo, getTodos } from "./db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const port = 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://127.0.0.1:3000" }));

app.get("*", (req, res) => {
  console.log("Server Get Request:", req.url);

  switch (req.url) {
    case "/todos":
      try {
        processRequest();
      } catch (err) {
        console.log(err);
      }
      async function processRequest() {
        res.json(await getTodos());
      }
      break;
    default:
      res.status(404).sendFile(__dirname + "/unknown.html");
      //   res.sendFile(__dirname + "/unknown.html");
      break;
  }
});

app.post("*", (req, res) => {
  console.log("Server Post Request:", req.url);
  switch (req.url) {
    case "/Addtodo":
      console.log(req.body);
      try {
        addTodo(req.body);
      } catch (err) {
        addTodo(err);
      }
      break;
    default:
      res.sendFile(__dirname + "/unknown.html");
      break;
  }
});

app.listen(port, () => console.log("Example app is listening on port 3001."));
