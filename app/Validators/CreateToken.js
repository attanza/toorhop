"use strict"

const { ResponseParser } = use("App/Helpers")
const messages = require("./messages")

class CreateToken {
  get rules() {
    return {
      client_key: "required"
    }
  }

  get messages() {
    return messages
  }

  async fails(errorMessages) {
    return this.ctx.response
      .status(422)
      .send(ResponseParser.apiValidationFailed(errorMessages))
  }
}

module.exports = CreateToken
