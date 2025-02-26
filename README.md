# Express Server to support the `Life Helper` application

- [Express Server to support the `Life Helper` application](#express-server-to-support-the-life-helper-application)
  - [Notes](#notes)
  - [Use](#use)
  - [CORS](#cors)
  - [Enable https in Express:](#enable-https-in-express)
  - [Web Push Setup](#web-push-setup)
  - [Routes](#routes)
    - [Get Routes](#get-routes)
    - [Post Routes](#post-routes)
  - [Database](#database)
    - [Users work tasks](#users-work-tasks)

## Notes

- See [this](https://dev.to/kamilrashidev/three-ways-to-enable-hot-reloading-in-express-js-796) to enable HMR in native ExpressJS
  - Note, when I to install the package for the native ExpressJS solution I got `express.js-hmr - Not found`
- For information on CORS package for and express look [here](https://expressjs.com/en/resources/middleware/cors.html).

## Use

- To start the server execute the following command.
  ```bash
  node server.jsf
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

- Since https is required to enable web push capability in the web server and mixed http/https would violate Content Security Policy it is implemented in this server.
- To enable https, create an SSL certificate for the IP address on which the server is listening with mkcert.
- See the Documentation README for detailed information.

## Web Push Setup

- To enable web push capability I installed the `web-push` package as follows:
  > npm i web-push

## Routes

### Get Routes

- To get a list of zero or more objectives, goals, tasks, notes or web push subscriptions
  - route: '/[objectives|goals|tasks|notes|wbs]?params={"parent_id":0,"completed_items":"no","started_items":"either","deleted_items":"no"}'
  - stored procedure: p_get_items
  - response: A JSON object containing and array of items each containing all the columns in the appropriate table.
- `THIS ROUTE IS NOT SUPPORTED YET; however, the stored procedure is used by web push`
- To get one objective, goal or task
  - route: '/[objective|goal|task]?params={"item_id":[integer]}'
  - stored procedure: p_get_items
  - response from database: A JSON object containing all the columns in the appropriate table.
  - response to request: The response from the database.

### Post Routes

<span id="shared-route-behavior"></span>

- Common route behavior:
  - response.ok is used to test all post routes for successful completion.
  - if the success callback in the database operation is called the operation it considered successful.
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
  - response from database: See the <a href="#shared-route-behavior">shared behavior</a>.
  - response to request: See <a href="#shared-route-behavior">shared behavior</a>.
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
  - response from database: See the <a href="#shared-route-behavior">shared behavior</a>.
  - response to request: See <a href="#shared-route-behavior">shared behavior</a>.
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
  - stored procedure: `p_add_item`
  - response from database: See the <a href="#shared-route-behavior">shared behavior</a>.
  - response to request: See <a href="#shared-route-behavior">shared behavior</a>.
- To add a user_login:
  - route: `/add/user_login`
  - body:
    ```
    {
        user_name: [string],
        password: [string],
        full_name: [string],
        display_name: [string],
        email_address: [string | null]
    }
    ```
  - stored procedure: `p_add_item`
  - response from database: See the <a href="#shared-route-behavior">shared behavior</a>.
  - response to request: See <a href="#shared-route-behavior">shared behavior</a>.
- To start, pause or complete a task:
  - route: `/[start|pause|complete]/task`
  - body:
    ```
    {
      task_id: [positive integer],
    }
    ```
  - stored procedure: `p_update_item`
  - response from database: See the <a href="#shared-route-behavior">shared behavior</a>.
  - response to request: See <a href="#shared-route-behavior">shared behavior</a>.
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
  - response from database: See the <a href="#shared-route-behavior">shared behavior</a>.
  - response to request: See <a href="#shared-route-behavior">shared behavior</a>.
- To login: Even though this is a `check` route there is no call to a check stored procedure. This is because of the need to protect the clear text password from ever being exposed to the database environment where it might be recorded in a log or a dump or whatever. The checking of the clear text password as presented by the user against the hashed password in the database is all done within the context of an in memory operation in the Express server.
  - route: `/check/user_login`
  - body:
    ```
    {
      user_name: [string],
      password: [string],
    }
    ```
  - stored procedure: `p_get_items`
  - response from database: A JSON object containing all the columns in the user_login table except the hashed_password and deleted_dtm columns.
  - response to request: The JSON object returned from the database.
- `THIS ROUTE DOES NOT YET EXIST AS OF 2/12/2025`: To attach a goal to an existing objective or a task to an existing goal:
  - route: `/attach/[goal|task]`
  - body:
    ```
    {
      parent_id: [positive integer],
      child_id: [positive integer],
    }
    ```
  - stored procedure: `p_attach_item`
  - response from database: `TO DO`
  - response from database: `TO DO`

## Database

### Users work tasks

- Here is a diagram of the relationship between users and tasks.

  ```mermaid
  erDiagram
    user_login ||--o{ task_user : works
    task ||--|{ task_user : "typically this is one to one...see notes below"
  ```

  - If a user is unable to complete a given task and it needs to get reassigned to another user then there would be two rows in task_user associated with that task.
  - A task can be reassigned only if it is in the started or paused state.
    - If a task is in the `paused state` then it can simply be reassigned.
    - If a task is in the `started state` then the reassignment logic should first pause it before reassigning it. In this way the time tracking logic can calculate the worked time for the original user assigned to the task.
