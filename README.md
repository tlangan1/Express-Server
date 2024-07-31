# Express Server to support the `Life Helper` application

## Notes

1. For information on CORS package for and express look [here](https://expressjs.com/en/resources/middleware/cors.html).
2. When I tried to run this server on David and Natalie's local network I received the ERR_CERT_COMMON_NAME_INVALID error. I found [this](https://devrix.com/tutorial/ssl-certificate-authority-local-https/) description of using openssl to create a root certificate authority and how to create security certificates for each of the development sites.
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
1. To enable https you need to create a self-signed SSL certificate. I used openSSL to do so.
1. The first command I issued was to generate a private key as shown below. Also, refer to Create an SSL Certificate using openSSL.docx for the full printout.

   > openssl genrsa -out localhost.key 2048

   `Note, I believe I renamed this to localhost-key.pem in the cert folder of the Life Helper express server.`

1. The second command I issued was to Certificate Signing Request file, a .csr file as shown below

   ```
   openssl req -new -key localhost.key -out localhost.csr
   ```

   `Note, I believe I renamed this to localhost.pem in the cert folder of the Life Helper express server.`

1. Finally, I created a self-signed SSL certificate, localhost.crt but I did not capture the actual command; however, it was something like the following but I don't think it had an expiration:
   <!--- cspell:disable -->

   > openssl x509 -signkey localhost.key -in localhost.csr -req -days 365 -out localhost.crt

   <!--- cspell:enable -->

1. See [this](https://www.baeldung.com/openssl-self-signed-cert) site for information about creating a self signed certificate.`.
1. See [this](https://thriveread.com/nodejs-https-server-with-express-and-createserver/) site for information about how to place the self-signed certificate in the `Trusted Root Certification Authorities` in the Microsoft Management Console accessible using the `mmc` command.
1. The server now listens on https://127.0.0.1:3001/.

## Web Push Setup

1. To enable web push capability install the `web-push` package as follows:
   > npm i web-push
