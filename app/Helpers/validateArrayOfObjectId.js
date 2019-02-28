'use strict'

const mongodb = require('mongodb')

module.exports = (input) => {
  if(Array.isArray(input)) {
    input.map(inp => {
      if(!mongodb.ObjectID.isValid(inp)) {
        let message = 'Invalid object Id'
        throw {message}
      }
    })
  }
  return true
}
