"use strict"

const IsDev = require("./Isdev")
const Env = use("Env")

module.exports = request => {
  if (IsDev(request)) {
    return {
      isProduction: false,
      serverKey: Env.get("MIDTRANS_DEV_SERVER_KEY"),
      clientKey: Env.get("MIDTRANS_DEV_CLIENT_KEY")
    }
  } else {
    return {
      isProduction: true,
      serverKey: Env.get("MIDTRANS_SERVER_KEY"),
      clientKey: Env.get("MIDTRANS_CLIENT_KEY")
    }
  }
}
