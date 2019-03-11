"use strict"

const IsDev = require("./Isdev")
const crypto = require("crypto")

module.exports = request => {
  const receivedJson = request.post()
  const { order_id, status_code, gross_amount, signature_key } = receivedJson
  let key
  if (IsDev(request)) key = Env.get("MIDTRANS_DEV_SERVER_KEY")
  else key = Env.get("MIDTRANS_SERVER_KEY")
  const text = `${order_id}${status_code}${gross_amount}${key}`
  const sha512 = crypto
    .createHash("sha512")
    .update(text)
    .digest("hex")
  if (sha512 !== signature_key) return false
  else return true
}
