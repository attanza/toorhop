"use strict"

const midtransClient = require("midtrans-client")
const { GetMidtransKeys, ResponseParser } = use("App/Helpers")

class MidtransSnapController {
  async getToken({ request, response }) {
    try {
      let snap = new midtransClient.Snap(GetMidtransKeys(request))
      let transaction_details = request.post()
      let gross_amount = 0
      transaction_details.item_details.map(
        item => (gross_amount += item.price * item.quantity)
      )
      transaction_details.gross_amount = gross_amount
      const transactionToken = await snap.createTransactionToken({
        transaction_details
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
