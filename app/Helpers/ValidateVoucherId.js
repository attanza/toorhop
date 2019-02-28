'use strict'

const mongodb = require('mongodb')
const Voucher = use('App/Models/Voucher')

module.exports = async voucherId => {
  if (mongodb.ObjectID.isValid(voucherId)) {
    return voucherId
  }
  const voucher = await Voucher.findBy('code', voucherId)
  if (voucher) return voucher._id

  return null
}
