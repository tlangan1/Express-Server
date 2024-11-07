# Express Server to support the `Life Helper` application

## Notes

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

- The server uses a hard-coded IP address of the web server to enable CORS requests from the web server.

## Enable https in Express:

- Since https is required to enable push capability in the web server
- and mixed http/https would violate Content Security Policy
- it is implemented in this server.
- To enable https, create a self-signed SSL certificate
- for the IP address on which the server is listening.
- You can do this mkcert with mkcert to do this. See the "Configure for a new Network" section of the README located here, "D:\Computer Science\Original Applications\Life Helper Docs and Apps\Life Helper Docs and Schema\Documentation".

## Web Push Setup

1. To enable web push capability install the `web-push` package as follows:
   > npm i web-push
