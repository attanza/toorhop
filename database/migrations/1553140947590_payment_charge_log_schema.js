"use strict"

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema")

class PaymentChargeLogSchema extends Schema {
  up() {
    this.create("payment_charge_logs", table => {
      table.increments()
      table.integer("user_id").unsigned()
      table.integer("midtrans_payment_id").unsigned()
      table.string("order_id")
      table.timestamps()
    })
  }

  down() {
    this.drop("payment_charge_logs")
  }
}

module.exports = PaymentChargeLogSchema
