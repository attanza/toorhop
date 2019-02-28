"use strict";

const { ResponseParser } = use("App/Helpers");

class AuthController {
  async login({ request, response, auth }) {
    try {
      const { username, password } = request.post();
      const data = await auth.withRefreshToken().attempt(username, password);
      return response
        .status(200)
        .send(ResponseParser.successResponse(data, "Login Succeed"));
    } catch (e) {
      return response
        .status(400)
        .send(ResponseParser.errorResponse("Login Failed"));
    }
  }
}

module.exports = AuthController;
