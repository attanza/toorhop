"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const midtransClient = require("midtrans-client")
const Env = use("Env")
const { ResponseParser, GetMidtransPostData } = use("App/Helpers")
const { TransactionLog } = use("App/Traits")
const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: Env.get("MIDTRANS_DEV_SERVER_KEY"),
  clientKey: Env.get("MIDTRANS_DEV_CLIENT_KEY")
})

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

      const postData = GetMidtransPostData(request, midtransPayment)
      const midtransResponse = await core.charge(postData)

      return response
        .status(200)
        .send(
          ResponseParser.successResponse(midtransResponse, "Midtrans Response")
        )
    } catch (e) {
      return response
        .status(400)
        .send(ResponseParser.errorResponse(e.ApiResponse || "Operation failed"))
    }
  }

  async notificationHandle({ request, response }) {
    const receivedJson = request.post()
    console.log("receivedJson", receivedJson)
    await TransactionLog(request, receivedJson)
    return response.status(200).send(receivedJson)
    // core.transaction
    //   .notification(receivedJson)
    //   .then(transactionStatusObject => {
    //     console.log("transactionStatusObject", transactionStatusObject)
    //     let orderId = transactionStatusObject.order_id
    //     let transactionStatus = transactionStatusObject.transaction_status
    //     let fraudStatus = transactionStatusObject.fraud_status

    //     let summary = `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}.<br>Raw notification object:<pre>${JSON.stringify(
    //       transactionStatusObject,
    //       null,
    //       2
    //     )}</pre>`

    //     // Sample transactionStatus handling logic
    //     if (transactionStatus == "capture") {
    //       if (fraudStatus == "challenge") {
    //         // TODO set transaction status on your databaase to 'challenge'
    //         console.log("challange")
    //       } else if (fraudStatus == "accept") {
    //         // TODO set transaction status on your databaase to 'success'
    //         console.log("success")
    //       }
    //     } else if (
    //       transactionStatus == "cancel" ||
    //       transactionStatus == "deny" ||
    //       transactionStatus == "expire"
    //     ) {
    //       // TODO set transaction status on your databaase to 'failure'
    //       console.log("cancel, deny, expired")
    //     } else if (transactionStatus == "pending") {
    //       // TODO set transaction status on your databaase to 'pending' / waiting payment
    //       console.log("pending")
    //     }
    //     console.log(summary)
    //     return response.status(200).send(summary)
    //   })
  }
}

module.exports = MidtranController
