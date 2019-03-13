"use strict"

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema")

class MidtransPaymentSchema extends Schema {
  up() {
    this.create("midtrans_payments", table => {
      table.increments()
      table.string("name", 100).unique()
      table.string("slug", 100).index()
      table.string("bank", 20)
      table.string("transaction_type", 50)
      table.string("payment_type", 50)
      table.string("logo")
      table.string("description")
      table.timestamps()
    })
  }

  down() {
    this.drop("midtrans_payments")
  }
}

module.exports = MidtransPaymentSchema
