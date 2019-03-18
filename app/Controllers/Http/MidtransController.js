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
const axios = require("axios")

class MidtranController {
  async index({ request, response }) {
    try {
      const defaultRules = { order_id: "required" }
      const refundRules = { amount: "required|number", reason: "required" }
      const tokenRules = {
        card_number: "required",
        card_cvv: "required",
        card_exp_month: "required|max:2",
        card_exp_year: "required|max:4",
        gross_amount: "required|number"
      }
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
          const tokenData = request.only([
            "card_number",
            "card_cvv",
            "card_exp_month",
            "card_exp_year",
            "gross_amount"
          ])
          const Env = use("Env")
          const url = Env.get("MIDTRANS_DEV_URL") + "/token"
          const key = Env.get("MIDTRANS_DEV_CLIENT_KEY")
          const endPoint = `${url}?client_key=${key}&gross_amount=${
            tokenData.gross_amount
          }&card_number=${tokenData.card_number}&card_exp_month=${
            tokenData.card_exp_month
          }&card_exp_year=${tokenData.card_exp_year}&card_cvv=${
            tokenData.card_cvv
          }&secure=true&bank=bca`
          const resp = await axios.get(endPoint)
          if (resp.status_code === "200") {
            return response
              .status(200)
              .send(ResponseParser.successResponse(resp.data, "Midtrans Token"))
          } else {
            return response
              .status(400)
              .send(
                ResponseParser.errorResponse("Midtrans Token failed", resp.data)
              )
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
      const postData = GetMidtransPostData(request, midtransPayment)
      const core = MidtransCore(request)
      // If Credit card requires additional data eg: card_number, cvv, etc
      if (midtransPayment.slug === "credit-card") {
        const rules = {
          card_number: "required",
          card_cvv: "required",
          card_exp_month: "required|max:2",
          card_exp_year: "required|max:2"
        }
        const isValid = await this.getValidate(request.all(), rules)
        if (!isValid) {
          return response
            .status(422)
            .send(ResponseParser.apiValidationFailed(validationErrors))
        }
        // Get initial credit card token
        const creditCardData = request.only([
          "card_number",
          "card_cvv",
          "card_exp_month",
          "card_exp_year"
        ])
        creditCardData.bank = midtransPayment.bank
        creditCardData.gross_amount = postData.transaction_details.gross_amount
        creditCardData.token_id =
          "481111-1114-0e68a4c4-85d3-48b5-b6cb-9945b2d3dcc9"
        const tokenResponse = await core.token(creditCardData)
        return response
          .status(200)
          .send(
            ResponseParser.successResponse(tokenResponse, "Credit Card Charge")
          )
      }

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

module.exports = MidtranController
