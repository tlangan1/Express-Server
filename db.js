import { createPool } from "mysql";

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
    pool.query(
      `Call p_get_items('${item_type}', ${queryString})`,
      function (error, rows) {
        if (error) {
          reject(new Error(error));
          return;
        }
        resolve(rows[0]);
      }
    );
  }
}

// Example of data sent from client
// Server Post Request: url is  /save-subscription body is {
//   endpoint: 'https://fcm.googleapis.com/fcm/send/dbseFk_fBFs:APA91bF7H_DNCm-1wSkp4jd_gOOLdUNKBBuFTaTcRnEo9bgiYGy90GYWRuzQlhn6IyZqu4cKY4KKn6r0prZY3PvJUWK7ju3XjEdm1fagmncBq90wTq6Nxpwilrm2-gcRCbxjykbc9x06',
//   expirationTime: null,
//   keys: {
//     p256dh: 'BMalLxKSXlIeXmKd3JAgFFinXGscLBu7K7MamFkb0TPgUhfTt2ff2r4pS5lVpAro-fAsCHAHPxq3JX2et39Aipc',
//     auth: 'bd3L6eKsOBPkb8fQ3pnt5g'
//   }
// }
export async function saveSubscription(data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        con.query(
          `Call p_save_push_subscription('${JSON.stringify(data)}')`,
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

export async function addItem(item_type, data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        con.query(
          `Call p_add_item('${item_type}', '${JSON.stringify(data)}')`,
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

export async function deleteItem(item_type, data) {
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

export async function startTask(data) {
  return new Promise(fn);

  function fn(resolve, reject) {
    pool.getConnection(function (err, con) {
      if (err) {
        return reject(err);
      } else {
        con.query(
          `Call p_start_task('${JSON.stringify(data)}')`,
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
