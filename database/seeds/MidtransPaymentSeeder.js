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
        payment_type: "bank_transfer"
      },
      {
        name: "Mandiri Bill Payment",
        bank: "Mandiri",
        transaction_type: "Bank Transfer",
        payment_type: "echannel"
      },
      {
        name: "BCA Virtual Account",
        bank: "BCA",
        transaction_type: "Bank Transfer",
        payment_type: "bank_transfer"
      },
      {
        name: "Permata Virtual Account",
        bank: "Permata",
        transaction_type: "Bank Transfer",
        payment_type: "bank_transfer"
      }
    ]
    await MidtransPayment.createMany(payments)
  }
}

module.exports = MidtransPaymentSeeder
