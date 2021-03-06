"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const {
  ResponseParser,
  GetMidtransPostData,
  MidtransCore,
  IsMidtransSign,
  GetMidtransToken,
  ErrorLog,
  IsDev
} = use("App/Helpers")
const { TransactionLog, ChargeLogTrait } = use("App/Traits")
const { validate } = use("Validator")
const axios = require("axios")
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

const callback_url = "https://jobs.toorhop.com/midtrans/production/"
const dev_callback_url = "https://jobs.toorhop.com/midtrans/development/"

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
          {
            const { order_id, amount, reason, refund_key } = request.post()
            let parameter = {
              amount,
              reason,
              refund_key
            }
            result = await core.transaction.refund(order_id, parameter)
          }
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

  async charge({ request, response, authClient }) {
    try {
      const { midtrans_payment_id, order_id } = request.post()
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
      await ChargeLogTrait.store({
        user_id: authClient.id,
        order_id,
        midtrans_payment_id
      })
      return response
        .status(200)
        .send(
          ResponseParser.successResponse(midtransResponse, "Midtrans Response")
        )
    } catch (e) {
      console.log("e", e)
      return response
        .status(400)
        .send(ResponseParser.errorResponse("Operation failed", e.ApiResponse))
    }
  }

  async notificationHandle({ request, response }) {
    try {
      const receivedJson = request.post()
      // if (!IsDev(request) && !IsMidtransSign(request)) {
      //   console.log("notification not authorized")
      //   return response.status(401).send(ResponseParser.unauthorizedResponse())
      // }
      console.log("receivedJson", receivedJson)
      await TransactionLog(request)
      // Send Callback
      if (!IsDev(request)) {
        console.log(`Sending notification to ${callback_url}`)
        await axios.post(callback_url, receivedJson)
      } else {
        console.log(`Sending notification to ${dev_callback_url}`)
        await axios.post(dev_callback_url, receivedJson)
      }
      return response.status(200).send(receivedJson)
    } catch (e) {
      console.log("notification handler error: ", e)
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
