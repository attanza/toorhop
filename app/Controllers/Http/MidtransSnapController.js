"use strict"

const midtransClient = require("midtrans-client")
const { GetMidtransKeys, ResponseParser } = use("App/Helpers")

class MidtransSnapController {
  async getToken({ request, response }) {
    try {
      const snap = new midtransClient.Snap(GetMidtransKeys(request))
      const { customer_details, item_details, order_id } = request.post()
      let transaction_details = {}
      let gross_amount = 0
      item_details.map(item => (gross_amount += item.price * item.quantity))
      transaction_details.gross_amount = gross_amount
      transaction_details.order_id = order_id
      const transactionToken = await snap.createTransactionToken({
        transaction_details,
        customer_details,
        item_details
      })
      return response
        .status(200)
        .send(
          ResponseParser.successResponse({ transactionToken }, "Midtrans token")
        )
    } catch (e) {
      console.log("e", e)
    }
  }
}

module.exports = MidtransSnapController
