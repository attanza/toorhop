"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const {
  ResponseParser,
  GetMidtransPostData,
  MidtransCore,
  IsMidtransSign,
  GetMidtransToken,
  ErrorLog
} = use("App/Helpers")
const { TransactionLog } = use("App/Traits")
const { validate } = use("Validator")
let isValid = false
let validationErrors = null

const defaultRules = { order_id: "required" }
const refundRules = { amount: "required|number", reason: "required" }
const tokenRules = {
  card_number: "required",
  card_cvv: "required",
  card_exp_month: "required|max:2",
  card_exp_year: "required|max:4",
  gross_amount: "required|number"
}
const ccRules = { token_id: "required" }

class MidtransController {
  async index({ request, response }) {
    try {
      isValid = await this.getValidate(request.all(), defaultRules)
      const { method } = request.params

      if (method === "refund")
        isValid = await this.getValidate(request.all(), refundRules)
      if (method === "token")
        isValid = await this.getValidate(request.all(), tokenRules)
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

        case "token": {
          const tokenData = getTokenData(request)
          const resp = await GetMidtransToken(tokenData)
          if (resp.status_code === "200") {
            return response
              .status(200)
              .send(ResponseParser.successResponse(resp, "Midtrans Token"))
          } else {
            return response
              .status(400)
              .send(ResponseParser.errorResponse("Midtrans Token failed", resp))
          }
        }

        default:
          return response
            .status(400)
            .send(ResponseParser.errorResponse("Unknown method"))
      }
      return response
        .status(200)
        .send(ResponseParser.successResponse(result, `Midtrans ${method}`))
    } catch (e) {
      if (e.error) {
        return response
          .status(422)
          .send(ResponseParser.apiValidationFailed(e.message))
      } else {
        const error = ErrorLog(request, e)
        return response.status(error.status).send({ meta: error.meta })
      }
    }
  }

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
      const core = MidtransCore(request)
      // If Credit card, requires additional data eg: card_number, cvv, etc
      if (midtransPayment.slug === "credit-card") {
        const isValid = await this.getValidate(request.all(), ccRules)
        if (!isValid) {
          return response
            .status(422)
            .send(ResponseParser.apiValidationFailed(validationErrors))
        }
        const { token_id } = request.post()
        postData["credit_card"] = {
          token_id
        }
      }

      const midtransResponse = await core.charge(postData)

      return response
        .status(200)
        .send(
          ResponseParser.successResponse(midtransResponse, "Midtrans Response")
        )
    } catch (e) {
      return response
        .status(400)
        .send(ResponseParser.errorResponse("Operation failed", e.ApiResponse))
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

  async getValidate(data, rules) {
    const messages = use("App/Validators/messages")
    const validation = await validate(data, rules, messages)

    if (validation.fails()) {
      validationErrors = validation.messages()
      return false
    }

    return true
  }
}

function getTokenData(request) {
  return request.only([
    "card_number",
    "card_cvv",
    "card_exp_month",
    "card_exp_year",
    "gross_amount"
  ])
}

module.exports = MidtransController
