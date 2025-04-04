"use strict";

import { createPool } from "mysql";
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
  password: "-UnderAWhiteSky1",
  database: database, //schema
  // Remember, connections are lazily created
  connectionLimit: 10,
});

/* *** *** */
// See https://itnext.io/avoid-these-mistakes-when-using-database-connection-pools-ce2368beab51
// for more information on implicit versus explicit connection access.
/* *** *** */

// In getItems I am using implicit connection access
export function getItems(itemType, queryString) {
  return new Promise(func);

  function func(resolve, reject) {
    var dbCall = "Call p_get_items(?, ?)";
    pool.query(
      dbCall,
      [itemType, JSON.stringify(queryString)],
      function (error, rows) {
        if (error) {
          var now = new Date().toLocaleString();
          appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
          reject(
            `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`
          );
          return;
        }
        resolve(rows[0]);
      }
    );
  }
}

// In getItem I am using implicit connection access
export function getItem(itemType, queryString) {
  return new Promise(func);

  function func(resolve, reject) {
    var dbCall = "Call p_get_item(?, ?)";
    pool.query(
      dbCall,
      [itemType, JSON.stringify(queryString)],
      function (error, rows) {
        if (error) {
          var now = new Date().toLocaleString();
          appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
          reject(
            `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`
          );
          return;
        }
        resolve(rows[0][0]);
      }
    );
  }
}

// In updateItem I am using explicit connection access
export async function updateItem(itemType, data, sendWebPush) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        var dbCall = "Call p_update_item(?, ?)";
        con.query(
          dbCall,
          [itemType, JSON.stringify(data)],
          function (error, rows) {
            if (error) {
              var now = new Date().toLocaleString();
              appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
              reject(
                `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`
              );
            } else {
              if (sendWebPush) {
                data.item_type = itemType;
                sendWebPushes(data);
              }
              return resolve(rows);
            }
          }
        );
        con.release(); // releasing connection to pool
      }
    }); // getConnection
  }
}

// In updateItem I am using explicit connection access
export async function addItem(itemType, data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        var dbCall = "Call p_add_item(?, ?)";
        con.query(
          dbCall,
          [itemType, JSON.stringify(data)],
          function (error, rows) {
            if (error) {
              var now = new Date().toLocaleString();
              appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
              reject(
                `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`
              );
            } else {
              // con.release(); // releasing connection to pool
              return resolve(rows);
            }
          }
        );
        con.release(); // releasing connection to pool
      }
    }); // getConnection
  }
}

// In checkItem I am using explicit connection access
export async function checkItem(itemType, data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        var dbCall = `Call p_check_${itemType} (?)`;
        con.query(dbCall, [JSON.stringify(data)], function (error, rows) {
          if (error) {
            var now = new Date().toLocaleString();
            appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
            reject(
              `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`
            );
          } else {
            // con.release(); // releasing connection to pool
            return resolve(rows);
          }
        });
        con.release(); // releasing connection to pool
      }
    }); // getConnection
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
