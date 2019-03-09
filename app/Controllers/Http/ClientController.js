"use strict"

const { ResponseParser } = use("App/Helpers")
const moment = use("moment")
const Env = use("Env")
const jwt = require("jsonwebtoken")
const User = use("App/Models/User")
const expiry = Env.get("CLIENT_TOKEN_EXPIRATION")
class ClientController {
  async createToken({ request, response }) {
    try {
      const { client_key } = request.post()
      const user = await User.findBy("client_key", client_key)
      if (!user) {
        return response
          .status(400)
          .send(ResponseParser.errorResponse("Client unknown"))
      }
      const date = moment().unix()
      const token = await jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + expiry * 60,
          data: {
            date,
            client_key: user.client_key
          }
        },
        user.secret
      )
      const tokenData = {
        date,
        client_key: user.client_key,
        token
      }
      return response
        .status(200)
        .send(
          ResponseParser.successResponse(tokenData, "Token created successfuly")
        )
    } catch (e) {
      return response
        .status(400)
        .send(ResponseParser.errorResponse("Token generate failed"))
    }
  }

  async extract({ response, authClient }) {
    return response
      .status(200)
      .send(ResponseParser.successResponse(authClient, "Auth Client"))
  }
}

module.exports = ClientController
