# Express Server to support the `Life Helper` application

## Notes

1. For information on CORS package for and express look [here](https://expressjs.com/en/resources/middleware/cors.html).
2. I found [this](https://devrix.com/tutorial/ssl-certificate-authority-local-https/) description of using openssl to create a root certificate authority and how to create security certificates for each of the development sites.
3. I used mkcert to do the above but it is not working on David and Natalie's network.
4. When I go back home today, 7/29/2024, I need to see if the solution I already had in place still works. If so, that proves to me that my solution was local network specific. I want a solution that will work on any local network.

## Use

1. To start the server execute the following command.

   > node server.js

2. 1. To start the server in debug mode execute the following command.
      > node --inspect server.js

3. The server listens on whatever ports are available on the machine on which it is running as well as localhost.
4. The server uses a local MySQL database to store and retrieve data.

## CORS

1. The server uses a regular expression to accept CORS requests from any localhost port.
2. The server uses the results of the networkInterfaces() call to allow CORS requests from those IP addresses.

## Enable https in Express:

1. The motivation to do this is to be able to use push capability and that requires https to function.
1. To enable https you need to create a self-signed SSL certificate for the IP address on which the server is listening. I used mkcert to do this. See the "Configure for a new Network" section of the README located here, "D:\Computer Science\Original Applications\Life Helper Docs and Apps\Life Helper Docs and Schema\Documentation".
1. The server listens on the 'WI-FI' IP address provided by the router on whatever network it is running.

## Web Push Setup

1. To enable web push capability install the `web-push` package as follows:
   > npm i web-push
