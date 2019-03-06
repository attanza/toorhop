"use strict";

const MidtransPayment = use("App/Models/MidtransPayment");

class MidtransPaymentSeeder {
  async run() {
    await MidtransPayment.truncate();
    await MidtransPayment.create({
      name: "BNI Virtual Account",
      bank: "BNI",
      transaction_type: "Bank Transfer",
      payment_type: "bank_transfer"
    });
  }
}

module.exports = MidtransPaymentSeeder;
