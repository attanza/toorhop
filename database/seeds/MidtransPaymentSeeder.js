"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")

class MidtransPaymentSeeder {
  async run() {
    await MidtransPayment.truncate()
    const payments = [
      {
        name: "BNI Virtual Account",
        bank: "BNI",
        transaction_type: "Bank Transfer",
        payment_type: "bank_transfer",
        description: "Pay from BNI ATM's or internet banking"
      },
      {
        name: "Mandiri Bill Payment",
        bank: "Mandiri",
        transaction_type: "Bank Transfer",
        payment_type: "echannel",
        description: "Pay from Mandiri ATM's or internet banking"
      },
      {
        name: "BCA Virtual Account",
        bank: "BCA",
        transaction_type: "Bank Transfer",
        payment_type: "bank_transfer",
        description: "Pay from BCA ATM's or internet banking"
      },
      {
        name: "Permata Virtual Account",
        bank: "Permata",
        transaction_type: "Bank Transfer",
        payment_type: "bank_transfer",
        description: "Pay from Permata ATM's or internet banking"
      },
      {
        name: "Credit Card",
        bank: "BCA",
        transaction_type: "Credit Card",
        payment_type: "credit_card",
        description: "Pay with VISA, MasterCard, JCB or Amex"
      }
    ]
    await MidtransPayment.createMany(payments)
  }
}

module.exports = MidtransPaymentSeeder
