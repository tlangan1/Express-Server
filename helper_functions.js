"use strict";

import { networkInterfaces } from "os";

const nets = networkInterfaces();
import { argv } from "node:process";

export const network_addresses = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
    if (net.family === familyV4Value && !net.internal) {
      if (!network_addresses[name]) {
        network_addresses[name] = [];
      }
      network_addresses[name].push(net.address);
    }
  }
}

export var environment;

// The port is passed in as command line arguments
argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
  if (val.includes("environment=")) {
    environment = val.substring(val.indexOf("=") + 1);
    console.log(`Environment is ${environment}`);
  }
});
