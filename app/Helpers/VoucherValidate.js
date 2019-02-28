'use strict'
const moment = require('moment')

module.exports = (request, voucher) => {
  const {
    gross_amount,
    // delivery_charge,
    payment_method,
    masked_card,
    order_type,
    resto_id,
    user_id
  } = request.get()

  // Check voucher date
  if (!checkBetweenTime(voucher.from, voucher.to, 'YYYY-MM-DD')) {
    throw parseError('Voucher is expired')
  }

  // Check Voucher Time
  if (voucher.startTime || voucher.endTime) {
    if (!checkBetweenTime(voucher.startTime, voucher.endTime)) {
      throw parseError(`This voucher is valid only between ${convertToTime(voucher.startTime)} - ${convertToTime(voucher.endTime)}.`)
    }
  }

  // Check voucher Type
  // Check order type
  if (!inArray(voucher.orderTypes, order_type)) {
    throw parseError('This voucher is not valid for this order type')
  }
  // Check Payment Method
  if (!inArray(voucher.paymentMethods, payment_method)) {
    throw parseError('This voucher not valid for this payment method')
  }

  // Check Minimum Transaction
  if (voucher.minTransaction && voucher.minTransaction > gross_amount) {
    throw parseError('This voucher not valid for this payment method')
  }

  // Check Resto
  if (!inArray(voucher.restos, resto_id, false)) {
    throw parseError('This voucher not valid for this resto')
  }

  // Check User
  if (!inArray(voucher.users, user_id, false)) {
    throw parseError('This voucher not valid for this user')
  }

  // Check Bin
  if (payment_with == 'creditcard' && masked_card && !inArray(voucher.bin, masked_card.substring(0, 6), false)) {
    throw parseError('This voucher not valid for this payment method')
  }
}

function checkBetweenTime(time1, time2, format = 'hh:mm:ss') {
  const time = moment()
  let beforeTime = moment(time1, format)
  let afterTime = moment(time2, format)
  if (time.isBetween(beforeTime, afterTime)) {
    return true
  }
  return false
}

function convertToTime(time) {
  return moment(time).format('HH:mm')
}

function inArray(arrayData, search, collection = true) {
  let searchResult = []
  if (arrayData && arrayData.length) {
    if (collection) {
      arrayData.map(data => {
        if (data.slug == search) {
          searchResult.push(data)
        }
      })
      if (searchResult.length) return true
      return false
    } else {
      arrayData.map(data => {
        if (data == search) {
          searchResult.push(data)
        }
      })
      if (searchResult.length) return true
      return false
    }
  }
  return true
}

function parseError(message, statusCode) {
  const error = new Error(message)
  error.status = statusCode || 400
  return error
}
