"use strict";

import { createPool } from "mysql2";
import fsSync from "fs";
import fsAsync from "fs/promises";
import { environment } from "./helper_functions.js";

import { sendWebPushes } from "./web_push.js";

// console.log("Environment is ", environment);

var DBErrorsPath = "DBErrors.txt";
if (!fsSync.existsSync(DBErrorsPath)) {
  await fsAsync.appendFile(DBErrorsPath, "DB Errors are logged here.\n");
  await fsAsync.appendFile(DBErrorsPath, "**************************\n\n");
}

var configPath = "./config.json";
var config = JSON.parse(fsSync.readFileSync(configPath, { encoding: "utf8" }));

var database = config[environment].database;

var pool = createPool({
  host: "localhost",
  user: "tlangan",
  password: "-UnderSky1",
  database: database, //schema
  // Remember, connections are lazily created
  connectionLimit: 10,
});

// const checkProcedureByItemType = {
//   // Add supported check routes here as they are implemented.
//   // Keep user_login out of this map because it is checked in server.js.
//   undefined: "Call p_check_undefined (?)",
// };

/* *** *** */
// See https://itnext.io/avoid-these-mistakes-when-using-database-connection-pools-ce2368beab51
// for more information on implicit versus explicit connection access.
/* *** *** */

// In getItems I am using implicit connection access
export async function getItems(itemType, queryString) {
  var dbCall = "Call p_get_items(?, ?)";
  try {
    const [rows] = await pool
      .promise()
      .execute(dbCall, [itemType, JSON.stringify(queryString)]);
    return rows[0];
  } catch (error) {
    var now = new Date().toLocaleString();
    appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
    throw `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`;
  }
}

// In updateItem I am using implicit connection access
export async function updateItem(itemType, data, sendWebPush) {
  var dbCall = "Call p_update_item(?, ?)";
  try {
    const [rows] = await pool
      .promise()
      .execute(dbCall, [itemType, JSON.stringify(data)]);
    if (sendWebPush) {
      data.item_type = itemType;
      sendWebPushes(data);
    }
    return rows[0];
  } catch (error) {
    var now = new Date().toLocaleString();
    appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
    throw `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`;
  }
}

// In addItem I am using implicit connection access
export async function addItem(itemType, data) {
  var dbCall = "Call p_add_item(?, ?)";
  try {
    const [rows] = await pool
      .promise()
      .execute(dbCall, [itemType, JSON.stringify(data)]);
    return rows[0];
  } catch (error) {
    var now = new Date().toLocaleString();
    appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
    throw `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`;
  }
}

/* *** Helper Functions *** */

export async function appendToFile(fileName, content) {
  var DBErrorsSeparator =
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n";
  var now = new Date().toLocaleString();

  try {
    await fsAsync.appendFile(`./${fileName}`, DBErrorsSeparator);
    await fsAsync.appendFile(`./${fileName}`, `${now}\n`);
    await fsAsync.appendFile(`./${fileName}`, content);
    await fsAsync.appendFile(`./${fileName}`, DBErrorsSeparator);
    await fsAsync.appendFile(`./${fileName}`, "\n");
  } catch (err) {
    console.log(err);
  }
}
