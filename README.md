# Express Server to support the `Life Helper` application

## Notes

- See [this](https://dev.to/kamilrashidev/three-ways-to-enable-hot-reloading-in-express-js-796) to enable HMR in native ExpressJS
  - Note, when I to install the package for the native ExpressJS solution I got `express.js-hmr - Not found`
- For information on CORS package for and express look [here](https://expressjs.com/en/resources/middleware/cors.html).

## Use

- To start the server execute the following command.
  ```bash
  node server.js
  ```
- To start the server in debug mode execute the following command.
  ```bash
  node --inspect server.js
  ```
- The server listens on whatever "Wi Fi" address was assigned by the router.
- The server uses a local MySQL database to store and retrieve data.

## CORS

- The server uses the IP address in config.json in the `web_server_url` node to enable CORS requests from the web server.
- See the Documentation README for detailed information.

## Enable https in Express:

- Since https is required to enable push capability in the web server and mixed http/https would violate Content Security Policy it is implemented in this server.
- To enable https, create an SSL certificate for the IP address on which the server is listening with mkcert.
- See the Documentation README for detailed information.

## Web Push Setup

- To enable web push capability I installed the `web-push` package as follows:
  > npm i web-push

## Routes

### Get Routes

- To get zero or more objectives, goals, tasks, notes or web push subscriptions
  - route: '/[objectives|goal|tasks|notes|wbs]?params={"parent_id":0,"completed_items":"no","started_items":"either","deleted_items":"no"}'
  - stored procedure: p_get_items

### Post Routes

- The principle that is being used to name `POST` routes is that the name should be sufficient for the data server to call the correct stored procedure without parsing the JSON data in the body.

- To add an objective, goal or task:
  - route: `/add/[objective|goal|task]`
  - body:
    ```
    {
      parent_id: [0 (for objectives)|positive integer],
      item_name: [string],
      item_description: [string]
    }
    ```
  - stored procedure: `p_add_item`
- To add a note to a note:
  - route: `/add/note`
  - body:
    ```
    {
      item_type: ['objective'|'goal'|'task'],
      parent_id: [positive integer],
      note_text: [string]
    }
    ```
  - stored procedure: `p_add_item`
- To add a web push subscription `Remember this happens in the service worker`:
  - route: `/add/web_push_subscription`
  - body:
    ```
    {
        endpoint: 'https://fcm.googleapis.com/fcm/send/fPyXIz1Sics:APA91bHxUDOTegKvpS5EpbG5-2-zyeKoJtd_GnWoe3s9KnueDeBogrSmPPv6o7XRZy3pCtupbpjUVlcvngnFWEra1f9mY0q6f5RH3n7AkFYf8IDjmuBgufzcnCroIlcb4quneIqS0FqP',
        expirationTime: null,
        keys: {
            p256dh: 'BPHuI-JEG2KCvT8xm1nuw1Urz9dNlMrDISWh1hvcuwbniou5iplBXE0aQXtapSFfmN_F2TyjBL8uVNgFVZtVLP4',
            auth: 'FuqWYxSp_dn2Hk5sfefAfA'
        }
    }
    ```
- To add a user_login:
  - route: `/add/user_login`
  - body:
    ```
    {
        user_name: [string],
        password: [???],
        full_name: [string],
        display_name: [string],
        expirationTime: null
    }
    ```
  - stored procedure: `p_add_item`
- To start, pause or complete a task:
  - route: `/[start|pause|complete]/task`
  - body:
    ```
    {
      task_id: [positive integer],
    }
    ```
  - stored procedure: `p_update_item`
- To cancel/delete an objective, goal or task:
  - route: `/cancel_delete/[objective|goal|task]`
  - body:
    ```
    {
        item_type: ['objective'|'goal'|'task'],
        item_id: [positive integer]
    }
    ```
  - stored procedure: `p_update_item`
- To attach a goal to an existing objective or a task to an existing goal:
  - route: `/attach/[goal|task]`
  - body:
    ```
    {
      parent_id: [positive integer],
      child_id: [positive integer],
    }
    ```
  - stored procedure: `p_attach_item`
