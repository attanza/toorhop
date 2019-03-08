"use strict"

const TransactionLog = use("App/Models/TransactionLog")

module.exports = async data => {
  return await TransactionLog.create({
    status_code: data.status_code,
    transaction_id: data.transaction_id,
    order_id: data.order_id,
    fraud_status: data.fraud_status,
    transaction_status: data.transaction_status,
    detail: JSON.stringify(data)
  })
}
