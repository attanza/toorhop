"use strict";

const Database = use("Database");
const User = use("App/Models/User");
const randomstring = require("randomstring");
class UserSeeder {
  async run() {
    await Database.table("users").truncate();
    await Database.table("tokens").truncate();

    await User.create({
      username: "administrator",
      password: "password",
      client: "Administrator",
      client_key: randomstring.generate({
        length: 12,
        charset: "alphabetic"
      }),
      secret: randomstring.generate({
        length: 40,
        charset: "hex"
      }),
      is_active: 1
    });

    await User.create({
      username: "toorhop",
      password: "password",
      client: "Toorhop",
      client_key: randomstring.generate({
        length: 12,
        charset: "alphabetic"
      }),
      secret: randomstring.generate({
        length: 40,
        charset: "hex"
      }),
      is_active: 1
    });
  }
}

module.exports = UserSeeder;
