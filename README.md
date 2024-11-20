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

1. To enable web push capability I installed the `web-push` package as follows:
   > npm i web-push
