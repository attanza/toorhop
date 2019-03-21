"use strict"

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model")

class PaymentChargeLog extends Model {
  user() {
    return this.belongsTo("App/Models/User")
  }

  paymentType() {
    return this.belongsTo("App/Models/MidtransPayment")
  }
}

module.exports = PaymentChargeLog
