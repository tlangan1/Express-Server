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

export async function addTodo(data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        con.query(
          //   `insert into todos (TODO_id, TODO_name) values (${data.todo_id}, '${data.todo_name}')`,
          `Call p_add_todo('${data.todo_name}')`,
          function (err, rows) {
            if (err) {
              return reject(err);
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
