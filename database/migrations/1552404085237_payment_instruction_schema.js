"use strict"

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema")

class PaymentInstructionSchema extends Schema {
  up() {
    this.create("payment_instructions", table => {
      table.increments()
      table.integer("midtrans_payment_id")
      table.string("name", 50)
      table.text("content")
      table.timestamps()
    })
  }

  down() {
    this.drop("payment_instructions")
  }
}

module.exports = PaymentInstructionSchema
