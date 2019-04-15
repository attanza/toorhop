"use strict"

const { ResponseParser } = use("App/Helpers")
const messages = require("./messages")

class StoreMidtransPayment {
  get rules() {
    return {
      customer_details: "required|object",
      item_details: "required|array",
      order_id: "required"
    }
  }

  get messages() {
    return messages
  }

  get sanitizationRules() {
    return {
      name: "trim|escape",
      bank: "trim|escape",
      transaction_type: "trim|escape",
      payment_type: "trim|escape",
      is_active: "toBoolean"
    }
  }

  async fails(errorMessages) {
    return this.ctx.response
      .status(422)
      .send(ResponseParser.apiValidationFailed(errorMessages))
  }
}

module.exports = StoreMidtransPayment
