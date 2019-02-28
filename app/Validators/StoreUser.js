"use strict";

const { ResponseParser } = use("App/Helpers");
const messages = require("./messages");

class StoreUser {
  get rules() {
    return {
      username: "required|max:50|unique:users",
      client: "required|max:50|unique:users",
      password: "required|min:6",
      role_id: "required|integer"
    };
  }

  get messages() {
    return messages;
  }

  async fails(errorMessages) {
    return this.ctx.response
      .status(422)
      .send(ResponseParser.apiValidationFailed(errorMessages));
  }
}

module.exports = StoreUser;
