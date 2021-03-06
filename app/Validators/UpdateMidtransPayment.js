"use strict"

const { ResponseParser } = use("App/Helpers")
const messages = require("./messages")

class UpdateMidtransPayment {
  get rules() {
    const id = this.ctx.params.id
    return {
      name: `required|max:50|unique:midtrans_payments,name,id,${id}`,
      bank: "required|max:20",
      transaction_type: "required|max:50",
      payment_type: "required|max:50",
      is_active: "boolean"
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

module.exports = UpdateMidtransPayment
