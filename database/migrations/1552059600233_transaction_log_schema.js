"use strict"

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema")

class TransactionLogSchema extends Schema {
  up() {
    this.create("transaction_logs", table => {
      table.increments()
      table.string("status_code")
      table.string("transaction_id")
      table.string("order_id")
      table.string("fraud_status")
      table.string("transaction_status")
      table.text("detail")
      table.string("ip")
      table.string("hostname")
      table.timestamps()
    })
  }

  down() {
    this.drop("transaction_logs")
  }
}

module.exports = TransactionLogSchema
