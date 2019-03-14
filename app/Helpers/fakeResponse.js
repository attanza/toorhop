module.exports = bank => {
  switch (bank) {
    case "BNI":
      return {
        status_code: "201",
        status_message: "Success, Bank Transfer transaction is created",
        transaction_id: "330562b6-a63d-4420-a2b7-51779a7a8c55",
        order_id: "ABCDEF18",
        gross_amount: "10000.00",
        currency: "IDR",
        payment_type: "bank_transfer",
        transaction_time: "2019-03-13 22:38:14",
        transaction_status: "pending",
        va_numbers: [
          {
            bank: "bni",
            va_number: "9888719321429918"
          }
        ],
        fraud_status: "accept"
      }

    case "Mandiri":
      return {
        status_code: "201",
        status_message: "OK, Mandiri Bill transaction is successful",
        transaction_id: "9b8bf65c-89b9-45ba-b364-c2d5bb717d99",
        order_id: "ABCDEF17",
        gross_amount: "10000.00",
        currency: "IDR",
        payment_type: "echannel",
        transaction_time: "2019-03-13 22:37:37",
        transaction_status: "pending",
        fraud_status: "accept",
        bill_key: "664970364047",
        biller_code: "70012"
      }

    case "BCA":
      return {
        status_code: "201",
        status_message: "Success, Bank Transfer transaction is created",
        transaction_id: "6e24119e-b94e-4108-802c-d56a190b43e4",
        order_id: "ABCDEF16",
        gross_amount: "10000.00",
        currency: "IDR",
        payment_type: "bank_transfer",
        transaction_time: "2019-03-13 22:36:49",
        transaction_status: "pending",
        va_numbers: [
          {
            bank: "bca",
            va_number: "41798719317689966429"
          }
        ],
        fraud_status: "accept"
      }

    case "Permata":
      return {
        status_code: "201",
        status_message: "Success, PERMATA VA transaction is successful",
        transaction_id: "1e9469d4-7998-41d9-89fa-9a0f9cf47d61",
        order_id: "ABCDEF15",
        gross_amount: "10000.00",
        currency: "IDR",
        payment_type: "bank_transfer",
        transaction_time: "2019-03-13 22:34:06",
        transaction_status: "pending",
        fraud_status: "accept",
        permata_va_number: "871004852801290"
      }

    default:
      return null
  }
}
