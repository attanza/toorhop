"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const {
  ResponseParser,
  GetMidtransPostData,
  MidtransCore,
  IsMidtransSign,
  fakeResponse
} = use("App/Helpers")
const { TransactionLog } = use("App/Traits")
const { validate } = use("Validator")
let isValid = false
let validationErrors = null
class MidtranController {
  async index({ request, response }) {
    try {
      const defaultRules = { order_id: "required" }
      const refundRules = { amount: "required|number", reason: "required" }
      isValid = await this.defaultValidation(request.all(), defaultRules)
      const { method } = request.params

      if (method === "refund")
        isValid = await this.defaultValidation(request.all(), refundRules)
      if (!isValid) {
        return response
          .status(422)
          .send(ResponseParser.apiValidationFailed(validationErrors))
      }
      const { order_id } = request.post()
      const core = MidtransCore(request)
      let result = null
      switch (method) {
        case "status":
          result = await core.transaction.status(order_id)
          break

        case "approve":
          result = await core.transaction.approve(order_id)
          break

        case "deny":
          result = await core.transaction.deny(order_id)
          break

        case "status":
          result = await core.transaction.status(order_id)
          break

        case "cancel":
          result = await core.transaction.cancel(order_id)
          break

        case "expire":
          result = await core.transaction.expire(order_id)
          break

        case "refund":
          result = await core.transaction.refund(order_id)
          break

        default:
          return response
            .status(400)
            .send(ResponseParser.errorResponse("Unknown method"))
      }
      return response
        .status(200)
        .send(ResponseParser.successResponse(result, `Midtrans ${method}`))
    } catch (e) {
      console.log("e", e)
      if (e.error) {
        return response
          .status(422)
          .send(ResponseParser.apiValidationFailed(e.message))
      }
      return response
        .status(400)
        .send(ResponseParser.errorResponse(e.ApiResponse || "Operation failed"))
    }
  }

  // Refund Transaction
  // let parameter = {
  //     "amount": 5000,
  //     "reason": "Item out of stock"
  // }
  // apiClient.transaction.refund('YOUR_ORDER_ID OR TRANSACTION_ID',parameter)
  //     .then((response)=>{
  //         // do something to `response` object
  //     });

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
      // const postData = fakeResponse(midtransPayment.bank)
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

  async defaultValidation(data, rules) {
    const messages = use("App/Validators/messages")
    const validation = await validate(data, rules, messages)

    if (validation.fails()) {
      validationErrors = validation.messages()
      return false
    }

    return true
  }
}

module.exports = MidtranController
