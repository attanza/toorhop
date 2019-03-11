"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const {
  ResponseParser,
  GetMidtransPostData,
  MidtransCore,
  IsMidtransSign
} = use("App/Helpers")
const { TransactionLog } = use("App/Traits")

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
      const core = MidtransCore(request)

      const postData = GetMidtransPostData(request, midtransPayment)
      // return response
      //   .status(200)
      //   .send(ResponseParser.successResponse(postData, "post data"))

      const midtransResponse = await core.charge(postData)

      return response
        .status(200)
        .send(
          ResponseParser.successResponse(midtransResponse, "Midtrans Response")
        )
    } catch (e) {
      console.log("e", e.message)
      return response
        .status(400)
        .send(ResponseParser.errorResponse(e.ApiResponse || "Operation failed"))
    }
  }

  async notificationHandle({ request, response }) {
    try {
      const receivedJson = request.post()
      if (!IsMidtransSign(request)) {
        return response.status(401).send(ResponseParser.unauthorizedResponse())
      }
      const core = MidtransCore(request)
      console.log("receivedJson", receivedJson)
      await TransactionLog(request)
      core.transaction
        .notification(receivedJson)
        .then(transactionStatusObject => {
          console.log("transactionStatusObject", transactionStatusObject)
          let orderId = transactionStatusObject.order_id
          let transactionStatus = transactionStatusObject.transaction_status
          let fraudStatus = transactionStatusObject.fraud_status
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
        })
      return response.status(200).send(receivedJson)
    } catch (e) {
      console.log("e", e)
    }
  }
}

module.exports = MidtranController
