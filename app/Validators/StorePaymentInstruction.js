"use strict"

const { ResponseParser } = use("App/Helpers")
const messages = require("./messages")

class StorePaymentInstruction {
  get rules() {
    return {
      midtrans_payment_id: "required|integer",
      name: "required|max:50",
      content: "required"
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

module.exports = StorePaymentInstruction
