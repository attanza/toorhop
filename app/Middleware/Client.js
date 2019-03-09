"use strict"

const { ResponseParser } = use("App/Helpers")
const User = use("App/Models/User")
const moment = use("moment")
const jwt = require("jsonwebtoken")
const Env = use("Env")
class Client {
  async handle(ctx, next) {
    try {
      console.log("ctx.request.headers()", ctx.request.headers())
      const client_key = ctx.request.header("x-toorhop-key")
      const { date, token } = ctx.request.headers()

      if (!date) {
        console.log("no date") //eslint-disable-line
        return ctx.response
          .status(401)
          .send(ResponseParser.unauthorizedResponse())
      }

      if (!checkDate(date)) {
        console.log("date expired") //eslint-disable-line
        return ctx.response
          .status(401)
          .send(ResponseParser.unauthorizedResponse())
      }

      if (!client_key) {
        console.log("no client_key") //eslint-disable-line

        return ctx.response
          .status(401)
          .send(ResponseParser.unauthorizedResponse())
      }

      if (!token) {
        console.log("no token") //eslint-disable-line

        return ctx.response
          .status(401)
          .send(ResponseParser.unauthorizedResponse())
      }

      const user = await User.findBy("client_key", client_key)
      if (!user) {
        console.log("no user") //eslint-disable-line
        return ctx.response
          .status(400)
          .send(ResponseParser.unauthorizedResponse())
      }

      if (!user.is_active) {
        console.log("User not active")
        return ctx.response
          .status(400)
          .send(ResponseParser.unauthorizedResponse())
      }

      const decrypted = jwt.verify(token, user.secret)
      if (!decrypted) {
        console.log("decrypt failed") //eslint-disable-line

        return ctx.response
          .status(400)
          .send(ResponseParser.unauthorizedResponse())
      }

      if (!checkDate(decrypted.data.date)) {
        console.log("decrypted date expired") //eslint-disable-line
        return ctx.response
          .status(401)
          .send(ResponseParser.unauthorizedResponse())
      }

      if (user.client_key !== decrypted.data.client_key) {
        console.log("client_key not matched") //eslint-disable-line
        return ctx.response
          .status(401)
          .send(ResponseParser.unauthorizedResponse())
      }

      ctx.authClient = user.toJSON()

      await next()
    } catch (e) {
      console.log("e", e)
      return ctx.response
        .status(401)
        .send(ResponseParser.unauthorizedResponse())
    }
  }
}

module.exports = Client

function checkDate(dateData) {
  const expiry = Env.get("CLIENT_TOKEN_EXPIRATION")
  const now = moment()
  const dateAdded = moment.unix(dateData).add(expiry, "m")

  if (now > dateAdded) return false
  return true
}
