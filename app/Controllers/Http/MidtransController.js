"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const midtransClient = require("midtrans-client")
const Env = use("Env")
const { ResponseParser } = use("App/Helpers")
const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: Env.get("MIDTRANS_DEV_SERVER_KEY"),
  clientKey: Env.get("MIDTRANS_DEV_CLIENT_KEY")
})
const changeCase = require("change-case")

class MidtranController {
  async charge({ request, response }) {
    try {
      const { midtrans_payment_id } = request.post()
      const midtransPayment = await MidtransPayment.find(midtrans_payment_id)
      if (!midtransPayment) {
        return response
          .status(400)
          .send(ResponseParser.errorResponse("Midtrans payment unknown"))
      }
      const { customer_details, item_details, order_id } = request.post()
      let gross_amount = 0
      item_details.map(item => (gross_amount += item.price * item.quantity))
      const postData = {
        payment_type: midtransPayment.payment_type,
        transaction_details: {
          gross_amount: 10000,
          order_id
        },
        customer_details,
        item_details,
        bank_transfer: {
          bank: changeCase.lowerCase(midtransPayment.bank),
          va_number: "111111"
        }
      }
      const midtransResponse = await core.charge(postData)

      return response
        .status(200)
        .send(
          ResponseParser.successResponse(midtransResponse, "Midtrans Response")
        )
    } catch (e) {
      console.log("e", e)
      return response
        .status(e.status)
        .send(ResponseParser.errorResponse(e.message))
    }
  }

  async notificationHandle({ request, response }) {
    const receivedJson = request.post()
    console.log("receivedJson", receivedJson)
    core.transaction
      .notification(receivedJson)
      .then(transactionStatusObject => {
        console.log("transactionStatusObject", transactionStatusObject)
        let orderId = transactionStatusObject.order_id
        let transactionStatus = transactionStatusObject.transaction_status
        let fraudStatus = transactionStatusObject.fraud_status

        let summary = `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}.<br>Raw notification object:<pre>${JSON.stringify(
          transactionStatusObject,
          null,
          2
        )}</pre>`

        // Sample transactionStatus handling logic
        if (transactionStatus == "capture") {
          if (fraudStatus == "challenge") {
            // TODO set transaction status on your databaase to 'challenge'
            console.log("challange")
          } else if (fraudStatus == "accept") {
            // TODO set transaction status on your databaase to 'success'
            console.log("success")
          }
        } else if (
          transactionStatus == "cancel" ||
          transactionStatus == "deny" ||
          transactionStatus == "expire"
        ) {
          // TODO set transaction status on your databaase to 'failure'
          console.log("cancel, deny, expired")
        } else if (transactionStatus == "pending") {
          // TODO set transaction status on your databaase to 'pending' / waiting payment
          console.log("pending")
        }
        console.log(summary)
        return response.status(200).send(summary)
      })
  }
}

module.exports = MidtranController
