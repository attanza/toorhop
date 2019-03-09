"use strict"

const { ResponseParser } = use("App/Helpers")
const messages = require("./messages")

class MidtransCharge {
  get rules() {
    return {
      order_id: "required",
      midtrans_payment_id: "required|integer",
      customer_details: "required|object",
      "customer_details.email": "required",
      "customer_details.first_name": "required|max:50",
      "customer_details.last_name": "max:50",
      "customer_details.phone": "required|max:20",

      item_details: "required|array",
      "item_details.*.id": "required",
      "item_details.*.price": "required|integer",
      "item_details.*.quantity": "required|integer",
      "item_details.*.name": "required|max:100"
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
