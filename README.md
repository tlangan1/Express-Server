# Express Server to support the `Life Helper` application

## Notes

1. For information on CORS package for and express look [here](https://expressjs.com/en/resources/middleware/cors.html).

## Use

1. To start the server execute the following command.
   ```
   node server.js
   ```
1. 1. To start the server in debug mode execute the following command.
   ```
   node --inspect server.js
   ```
1. The server listens on http://127.0.0.1:3001/.
1. The server uses a local MySQL database to store and retrieve data.h

## Enable https in Express:

1. The motivation to do this is to be able to use push capability and that requires https to function.
1. To enable https you need to create a self-signed SSL certificate. I used openSSL to do so.
1. The first command I issued was to generate a private key as shown below. Also, refer to Create an SSL Certificate using openSSL.docx for the full printout.
   ```
   openssl genrsa -out localhost.key 2048
   ```
1. The second command I issued was to Certificate Signing Request file, a .csr file as shown below
   ```
   openssl req -new -key localhost.key -out localhost.csr
   ```
1. Finally, I created a self-signed SSL certificate, localhost.crt but I did not capture the actual command; however, it was something like the following but I don't think it had an expiration:
   ```
   openssl x509 -signkey localhost.key -in localhost.csr -req -days 365 -out localhost.crt
   ```
1. See [this](https://www.baeldung.com/openssl-self-signed-cert) site and (this)[https://thriveread.com/nodejs-https-server-with-express-and-createserver/] site for more information.
1. I configured the server to now listen on https://127.0.0.1:3001/.

## Web Push Setup

1. To enable web push capability install the `web-push` package as follows:
   ```
   npm i web-push
   ```
