"use strict"

const midtransClient = require("midtrans-client")
const IsDev = require("./Isdev")
const Env = use("Env")

module.exports = request => {
  let core
  if (IsDev(request)) {
    core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: Env.get("MIDTRANS_DEV_SERVER_KEY"),
      clientKey: Env.get("MIDTRANS_DEV_CLIENT_KEY")
    })
    console.log(
      `Midtrans Core in Development with key ${Env.get(
        "MIDTRANS_DEV_CLIENT_KEY"
      )}`
    )
  } else {
    core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: Env.get("MIDTRANS_SERVER_KEY"),
      clientKey: Env.get("MIDTRANS_CLIENT_KEY")
    })
    console.log(
      `Midtrans Core in Production with key ${Env.get(
        "MIDTRANS_DEV_CLIENT_KEY"
      )}`
    )
  }
  return core
}
