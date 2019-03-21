"use strict"

const PaymentChargeLog = use("App/Models/PaymentChargeLog")

class ChargeLogTrait {
  async store(data) {
    return await PaymentChargeLog.create(data)
  }

  async getUser(orderId) {
    let log = await PaymentChargeLog.query()
      .with("user")
      .where("order_id", orderId)
      .first()
    if (log) {
      log = log.toJSON()
      return log.user
    }
    return null
  }
}

module.exports = new ChargeLogTrait()
