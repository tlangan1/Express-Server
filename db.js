"use strict";

import { createPool } from "mysql";
import fsSync from "fs";
import fsAsync from "fs/promises";

var DBErrorsPath = "DBErrors.txt";
if (!fsSync.existsSync(DBErrorsPath)) {
  await fsAsync.appendFile(DBErrorsPath, "DB Errors are logged here.\n");
  await fsAsync.appendFile(DBErrorsPath, "**************************\n\n");
}

var pool = createPool({
  host: "localhost",
  user: "tlangan",
  password: "-UnderAWhiteSky1",
  database: "life_helper", //schema
  // Remember, connections are lazily created
  connectionLimit: 10,
});

export function getItems(item_type, queryString) {
  try {
    return new Promise(func);
  } catch (err) {
    console.log("Database error", err);
  }

  function func(resolve, reject) {
    var dbCall = "Call p_get_items(?, ?)";
    pool.query(
      dbCall,
      [item_type, JSON.stringify(queryString)],
      function (error, rows) {
        if (error) {
          reject(error.message);
          return;
        }
        resolve(rows[0]);
      }
    );
  }
}

// export function getItem(item_type, queryString) {
//   try {
//     return new Promise(func);
//   } catch (err) {
//     console.log("Database error", err);
//   }

//   function func(resolve, reject) {
//     var dbCall = "Call p_get_item(?, ?)";
//     pool.query(
//       dbCall,
//       [item_type, JSON.stringify(queryString)],
//       function (error, rows) {
//         if (error) {
//           reject(error.message);
//           return;
//         }
//         resolve(rows[0]);
//       }
//     );
//   }
// }

export async function addItem(item_type, data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        var dbCall = "Call p_add_item(?, ?)";
        con.query(
          dbCall,
          [item_type, JSON.stringify(data)],
          function (error, rows) {
            if (error) {
              var now = new Date().toLocaleString();
              appendToFile(DBErrorsPath, dbCall + "\n" + error.message + "\n");
              reject(
                `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`
              );
            } else {
              con.release(); // releasing connection to pool
              return resolve(rows);
            }
          }
        );
      }
    }); // getConnection
  }
}

export async function deleteItem(item_type, data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      var dbCall = "Call p_delete_item(?, ?)";
      if (err) {
        return reject(err);
      } else {
        con.query(
          dbCall,
          [item_type, JSON.stringify(data)],
          function (error, rows) {
            if (error) {
              reject(error.message);
            } else {
              con.release(); // releasing connection to pool
              return resolve(rows);
            }
          }
        );
      }
    }); // getConnection
  }
}

export async function startTask(data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      var dbCall = "Call p_start_task(?)";
      if (err) {
        return reject(err);
      } else {
        con.query(dbCall, [JSON.stringify(data)], function (error, rows) {
          if (error) {
            reject(error.message);
          } else {
            con.release(); // releasing connection to pool
            return resolve(rows);
          }
        });
      }
    }); // getConnection
  }
}

export async function completeTask(data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      var dbCall = "Call p_complete_task(?)";
      if (err) {
        return reject(err);
      } else {
        con.query(dbCall, [JSON.stringify(data)], function (error, rows) {
          if (error) {
            var now = new Date().toLocaleString();
            appendToFile(
              DBErrorsPath,
              dbCall + "\n" + error.message + "\n" + JSON.stringify(data) + "\n"
            );
            reject(
              `See ${DBErrorsPath} on the data server for an entry dated ${now} for more details.`
            );
          } else {
            con.release(); // releasing connection to pool
            return resolve(rows);
          }
        });
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
