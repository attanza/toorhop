"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const midtransClient = require("midtrans-client")
const Env = use("Env")
const { ResponseParser, GetMidtransPostData } = use("App/Helpers")
const { TransactionLog } = use("App/Traits")
const crypto = require("crypto")
const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: Env.get("MIDTRANS_DEV_SERVER_KEY"),
  clientKey: Env.get("MIDTRANS_DEV_CLIENT_KEY")
})

class MidtranController {
  async charge({ request, response }) {
    try {
      const { midtrans_payment_id } = request.post()
      const midtransPayment = await MidtransPayment.find(midtrans_payment_id)
      if (!midtransPayment) {
        return response
          .status(400)
          .send(ResponseParser.errorResponse("Midtrans payment unknown"))
      }

      const postData = GetMidtransPostData(request, midtransPayment)
      // return response
      //   .status(200)
      //   .send(ResponseParser.successResponse(postData, "post data"))

      const midtransResponse = await core.charge(postData)

      return response
        .status(200)
        .send(
          ResponseParser.successResponse(midtransResponse, "Midtrans Response")
        )
    } catch (e) {
      console.log("e", e.message)
      return response
        .status(400)
        .send(ResponseParser.errorResponse(e.ApiResponse || "Operation failed"))
    }
  }

  async notificationHandle({ request, response }) {
    const receivedJson = request.post()
    const { order_id, status_code, gross_amount, signature_key } = receivedJson
    // Validate signature key
    console.log("receivedJson", receivedJson)
    const key = Env.get("MIDTRANS_DEV_SERVER_KEY")
    const text = `${order_id}${status_code}${gross_amount}${key}`
    console.log("text", text)
    const sha512 = crypto
      .createHash("sha512")
      .update(text)
      .digest("hex")
    console.log("created key", sha512)
    console.log("midtrans signature: ", signature_key)
    if (sha512 !== signature_key) {
      return response.status(401).send(ResponseParser.unauthorizedResponse())
    }
    await TransactionLog(request, receivedJson)
    return response.status(200).send(receivedJson)
    // core.transaction
    //   .notification(receivedJson)
    //   .then(transactionStatusObject => {
    //     console.log("transactionStatusObject", transactionStatusObject)
    //     let orderId = transactionStatusObject.order_id
    //     let transactionStatus = transactionStatusObject.transaction_status
    //     let fraudStatus = transactionStatusObject.fraud_status

    //     let summary = `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}.<br>Raw notification object:<pre>${JSON.stringify(
    //       transactionStatusObject,
    //       null,
    //       2
    //     )}</pre>`

    //     // Sample transactionStatus handling logic
    //     if (transactionStatus == "capture") {
    //       if (fraudStatus == "challenge") {
    //         // TODO set transaction status on your databaase to 'challenge'
    //         console.log("challange")
    //       } else if (fraudStatus == "accept") {
    //         // TODO set transaction status on your databaase to 'success'
    //         console.log("success")
    //       }
    //     } else if (
    //       transactionStatus == "cancel" ||
    //       transactionStatus == "deny" ||
    //       transactionStatus == "expire"
    //     ) {
    //       // TODO set transaction status on your databaase to 'failure'
    //       console.log("cancel, deny, expired")
    //     } else if (transactionStatus == "pending") {
    //       // TODO set transaction status on your databaase to 'pending' / waiting payment
    //       console.log("pending")
    //     }
    //     console.log(summary)
    //     return response.status(200).send(summary)
    //   })
  }
}

module.exports = MidtranController

// $orderId = "1111";
// $statusCode = "200";
// $grossAmount = "100000.00";
// $serverKey = "askvnoibnosifnboseofinbofinfgbiufglnbfg";
// $input = $orderId.$statusCode.$grossAmount.$serverKey;
// $signature = openssl_digest($input, 'sha512');
// echo "INPUT: " , $input."<br/>";
// echo "SIGNATURE: " , $signature;
// SHA512(order_id+status_code+gross_amount+serverkey)

//  receivedJson { va_numbers: [ { va_number: '9888719372310311', bank: 'bni' } ],
