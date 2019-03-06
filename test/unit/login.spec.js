"use strict"

const User = use("App/Models/User")

const { test, trait } = use("Test/Suite")("Login")

trait("Test/ApiClient")
trait("DatabaseTransactions")
trait("Auth/Client")

const endpoint = "api/v1/login"

/**
 * Login
 */

test("Can Login if user is exist", async ({ client }) => {
  const user = await User.find(1)
  const response = await client
    .post(endpoint)
    .send({ username: user.username, password: "password" })
    .end()
  response.assertStatus(200)
})

test("Cannot Login if user is doesnt exist", async ({ client }) => {
  const response = await client
    .post(endpoint)
    .send({ username: "testusername", password: "password" })
    .end()
  response.assertStatus(400)
})

test("Cannot Login with uncomplete data", async ({ client }) => {
  const response = await client
    .post(endpoint)
    .send({ username: "testusername" })
    .end()
  response.assertStatus(400)
})
