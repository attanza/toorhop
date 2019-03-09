"use strict"

const changeCase = require("change-case")
const randomstring = require("randomstring")
var r, m

/**
 * Generate Payment Post Data
 * @param {*} request
 * @param {*} midtransPayment
 */

module.exports = (request, midtransPayment) => {
  r = request
  m = midtransPayment
  switch (midtransPayment.slug) {
    case "bni-virtual-account":
      return bni_virtual_account()
    case "mandiri-bill-payment":
      return mandiri_bill_payment()

    default:
      return nul
  }
}

/**
 * Generate 16 numeric character for va_numbers
 */

function strRand() {
  return randomstring.generate({
    length: 16,
    charset: "numeric"
  })
}

/**
 * Get Base Data
 * @returns {payment_type, transaction_details, customer_details, item_details}
 */

function getBaseData() {
  const { customer_details, item_details, order_id } = r.post()
  let gross_amount = 0
  item_details.map(item => (gross_amount += item.price * item.quantity))
  return {
    payment_type: m.payment_type,
    transaction_details: {
      gross_amount,
      order_id
    },
    customer_details,
    item_details
  }
}

/**
 * BNI Virtual Account Post Data
 * @returns {baseData, bank_transfer}
 */

function bni_virtual_account() {
  let postData = getBaseData(r)
  postData.bank_transfer = {
    bank: changeCase.lowerCase(m.bank),
    va_number: strRand()
  }
  return postData
}

/**
 * BNI Virtual Account Post Data
 * @returns {baseData}
 */

function mandiri_bill_payment() {
  const { order_id } = r.post()
  let postData = getBaseData()
  postData.echannel = {
    bill_info1: "Payment For: " + order_id
  }
  return postData
}
