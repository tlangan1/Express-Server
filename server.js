// server.js: This code provides a thin wrapper around an express server
// listening for http requests on port 3001

import express from "express";
import {
  addObjective,
  deleteObjective,
  getObjectives,
  getGoals,
} from "./db.js";
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
  console.log("Server Get Request:", "url is ", req.url, "body is", req.body);

  switch (req.url) {
    case "/get/objectives":
      getObjectivesAsync();
      async function getObjectivesAsync() {
        try {
          res.json(await getObjectives());
        } catch (err) {
          console.log("DB Error:", err);
          res.statusMessage = err;
          res.sendStatus(404);
        }
      }
      break;
    case "/get/goals":
      getGoalsAsync();
      async function getGoalsAsync() {
        try {
          res.json(await getGoals());
        } catch (err) {
          console.log("DB Error:", err);
          res.statusMessage = err;
          res.sendStatus(404);
        }
      }
      break;
    default:
      res.statusMessage = `Endpoint ${req.url} not supported`;
      res.sendStatus(404);
      break;
  }
});

app.post("*", (req, res) => {
  console.log("Server Post Request:", "url is ", req.url, "body is", req.body);
  switch (req.url) {
    case "/add/objective":
      addObjectiveAsync(req.body);
      async function addObjectiveAsync(data) {
        try {
          await addObjective(data);
          res.sendStatus(200);
        } catch (err) {
          console.log("DB Error:", err);
          res.statusMessage = err;
          res.sendStatus(404);
        }
      }
      break;
    case "/delete/objective":
      deleteObjectiveAsync(req.body);
      async function deleteObjectiveAsync(data) {
        try {
          await deleteObjective(data);
          res.sendStatus(200);
        } catch (err) {
          console.log("DB Error:", err);
          res.statusMessage = err;
          res.sendStatus(404);
        }
      }
      break;
    default:
      res.statusMessage = `Endpoint ${req.url} not supported`;
      res.sendStatus(404);
      break;
  }
});

app.listen(port, () =>
  console.log("Express server is listening on port 3001.")
);
