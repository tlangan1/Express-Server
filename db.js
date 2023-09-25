// db.js: This code provides a thin wrapper around a mysql server

import { createPool } from "mysql";

var pool = createPool({
  host: "localhost",
  user: "tlangan",
  password: "-UnderAWhiteSky1",
  database: "todos", //schema
  // Remember, connections are lazily created
  connectionLimit: 10,
});

export function getTodos() {
  try {
    return new Promise(func);
  } catch (err) {
    console.log("Database error", err);
  }

  function func(resolve, reject) {
    pool.query("select * from todos", function (error, rows) {
      if (error) reject(error);
      var x = rows.map((item) => item.todo_name);
      resolve(x);
    });
  }
}

export function getTasks() {
  try {
    return new Promise(func);
  } catch (err) {
    console.log("Database error", err);
  }

  function func(resolve, reject) {
    pool.query("select * from tasks", function (error, rows) {
      if (error) {
        reject(new Error(error));
        return;
      }
      var x = rows.map((item) => item.todo_name);
      resolve(x);
    });
  }
}

export function getObjectives() {
  try {
    return new Promise(func);
  } catch (err) {
    console.log("Database error", err);
  }

  function func(resolve, reject) {
    pool.query("select * from objective", function (error, rows) {
      if (error) {
        reject(new Error(error));
        return;
      }
      var x = rows.map((item) => item.objective_name);
      resolve(x);
    });
  }
}

export async function addObjective(data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        con.query(
          `Call p_add_objective('${data.name}', '${data.description}')`,
          function (err, rows) {
            if (err) {
              reject(new Error(err));
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
