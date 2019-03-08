"use strict"

const { ResponseParser } = use("App/Helpers")
const messages = require("./messages")

class MidtransCharge {
  get rules() {
    return {
      order_id: "required",
      midtrans_payment_id: "required|integer",
      customer_details: "required|object",
      item_details: "required|array"
    }
  }

  get messages() {
    return messages
  }

  async fails(errorMessages) {
    return this.ctx.response
      .status(422)
      .send(ResponseParser.apiValidationFailed(errorMessages))
  }
}

module.exports = MidtransCharge
