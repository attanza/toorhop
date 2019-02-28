"use strict";

const { ResponseParser } = use("App/Helpers");
const messages = require("./messages");

class UpdateUser {
  get rules() {
    const id = this.ctx.params.id;
    return {
      username: `required|max:50|unique:users,username,id,${id}`,
      client: `required|max:50|unique:users,client,id,${id}`,
      role_id: "required|integer",
      is_active: "boolean"
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

module.exports = UpdateUser;
