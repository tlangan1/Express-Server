// db.js: This code provides a thin wrapper around a mysql server

import { createPool } from "mysql";

var pool = createPool({
  host: "localhost",
  user: "tlangan",
  password: "-UnderAWhiteSky1",
  database: "life_helper", //schema
  // Remember, connections are lazily created
  connectionLimit: 10,
});

export function getItems(item_type) {
  try {
    return new Promise(func);
  } catch (err) {
    console.log("Database error", err);
  }

  function func(resolve, reject) {
    pool.query(`Call p_get_${item_type}`, function (error, rows) {
      if (error) {
        reject(new Error(error));
        return;
      }
      resolve(rows[0]);
    });
  }
}

export async function addItem(data, item_type) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        con.query(
          `Call p_add_item('${JSON.stringify(data)}', '${item_type}')`,
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

export async function deleteItem(data, item_type) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        con.query(
          `Call p_delete_item('${JSON.stringify(data)}', '${item_type}')`,
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

// export async function addObjective(data) {
//   return new Promise(fn);

//   function fn(resolve, reject) {
//     pool.getConnection(function (err, con) {
//       if (err) {
//         return reject(err);
//       } else {
//         con.query(
//           `Call p_add_objective('${data.name}', '${data.description}')`,
//           function (err, rows) {
//             if (err) {
//               reject(new Error(err));
//             } else {
//               con.release(); // releasing connection to pool
//               return resolve(rows);
//             }
//           }
//         );
//       }
//     }); // getConnection
//   }
// }

// export async function deleteObjective(data) {
//   return new Promise(fn);

//   function fn(resolve, reject) {
//     pool.getConnection(function (err, con) {
//       if (err) {
//         return reject(err);
//       } else {
//         con.query(
//           `Call p_delete_objective('${data.item_id}')`,
//           function (err, rows) {
//             if (err) {
//               reject(new Error(err));
//             } else {
//               con.release(); // releasing connection to pool
//               return resolve(rows);
//             }
//           }
//         );
//       }
//     }); // getConnection
//   }
// }
