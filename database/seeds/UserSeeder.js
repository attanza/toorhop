"use strict"

const Database = use("Database")
const User = use("App/Models/User")
const randomstring = require("randomstring")
class UserSeeder {
  async run() {
    await Database.table("users").truncate()
    await Database.table("tokens").truncate()
    await Database.table("payment_charge_logs").truncate()

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
    })

    await User.create({
      username: "toorhop",
      password: "password",
      client: "Toorhop",
      client_key: "LFgQNUYugaRy",
      secret: "63124939efecaefa67b2e22cd09881b49e748f2b",
      is_active: 1,
      callback_url: "https://jobs.toorhop.com/midtrans/production",
      dev_callback_url: "https://jobs.toorhop.com/midtrans/development"
    })
  }
}

module.exports = UserSeeder
