"use strict"

const User = use("App/Models/User")

const { test, trait } = use("Test/Suite")("Users")

trait("Test/ApiClient")
trait("DatabaseTransactions")
trait("Auth/Client")

const endpoint = "api/v1/users"

/**
 * List of User
 */

test("Unathorized cannot get User List", async ({ client }) => {
  const response = await client.get(endpoint).end()
  response.assertStatus(401)
})

test("Forbidden cannot get User List", async ({ client }) => {
  const user = await User.find(2)
  const response = await client
    .get(endpoint)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(403)
})

test("Authorized can get User List", async ({ client }) => {
  const user = await User.find(1)
  const response = await client
    .get(endpoint)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(200)
})

/**
 * Create User
 */

test("Unathorized cannot create User", async ({ client }) => {
  const response = await client
    .post(endpoint)
    .send(UserData())
    .end()
  response.assertStatus(401)
})

test("Forbidden cannot Create User", async ({ client, assert }) => {
  const user = await User.find(2)
  const newUser = UserData()
  const response = await client
    .post(endpoint)
    .loginVia(user, "jwt")
    .send(newUser)
    .end()
  response.assertStatus(403)
})

test("Authorized can Create User", async ({ client, assert }) => {
  const user = await getAdmin()
  const newUser = UserData()
  const response = await client
    .post(endpoint)
    .loginVia(user, "jwt")
    .send(newUser)
    .end()
  response.assertStatus(201)
  response.assertJSONSubset({
    data: {
      username: newUser.username,
      client: newUser.client
    }
  })

  let userDb = await User.findBy("username", newUser.username)
  userDb = userDb.toJSON()
  assert.isObject(userDb)
})

test("Cannot Create User with uncomplete data", async ({ client }) => {
  const user = await User.find(1)
  const response = await client
    .post(endpoint)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(422)
})

/**
 * Update User
 */

test("Unathorized cannot Update User", async ({ client }) => {
  const editing = await User.find(2)
  const response = await client
    .put(endpoint + "/" + editing.id)
    .send(UserData())
    .end()
  response.assertStatus(401)
})

test("Forbidden cannot Update User", async ({ client }) => {
  const user = await User.find(2)
  const editing = await User.find(2)
  const updateUser = UserData()
  const response = await client
    .put(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .send(UserData())
    .end()
  response.assertStatus(403)
})

test("Authorized can Update User", async ({ client }) => {
  const user = await getAdmin()
  const editing = await User.find(2)
  const updateUser = UserData()
  const response = await client
    .put(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .send(UserData())
    .end()
  response.assertStatus(200)
  response.assertJSONSubset({
    data: {
      username: updateUser.username,
      client: updateUser.client
    }
  })
})

test("Cannot Update unexisted User", async ({ client }) => {
  const user = await getAdmin()
  const response = await client
    .put(endpoint + "/" + 35)
    .loginVia(user, "jwt")
    .send(UserData())
    .end()
  response.assertStatus(400)
})

/**
 * Show User
 */

test("Unathorized cannot Show User", async ({ client }) => {
  const user = await User.find(1)
  const response = await client.get(endpoint + "/" + user.id).end()
  response.assertStatus(401)
})

test("Forbidden cannot Show User", async ({ client }) => {
  const user = await User.find(2)
  const editing = await User.find(2)
  const response = await client
    .get(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(403)
})

test("Authorized can Show User", async ({ client }) => {
  const user = await User.find(1)
  const editing = await User.find(2)
  const response = await client
    .get(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(200)
})

test("Cannot Show unexisted User", async ({ client }) => {
  const user = await User.find(1)
  const response = await client
    .get(endpoint + "/" + 35)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(400)
})

/**
 * Delete User
 */

test("Unathorized cannot Delete User", async ({ client }) => {
  const user = await User.find(1)
  const response = await client.delete(endpoint + "/" + user.id).end()
  response.assertStatus(401)
})

test("Forbidden cannot Delete User", async ({ client, assert }) => {
  const user = await User.find(2)
  const editing = await User.find(2)
  const response = await client
    .delete(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(403)
})

test("Authorized can Delete User", async ({ client, assert }) => {
  const user = await User.find(1)
  const editing = await User.find(2)
  const response = await client
    .delete(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(200)

  let userDb = await User.findBy("username", editing.username)
  assert.isNull(userDb)
})

test("Cannot Delete unexisted User", async ({ client }) => {
  const user = await User.find(1)
  const response = await client
    .delete(endpoint + "/" + 35)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(400)
})

/**
 * Form Data
 */

function UserData() {
  return {
    username: "testuser",
    client: "testclient",
    role_id: 1,
    password: "password"
  }
}

async function getAdmin() {
  return await User.query()
    .whereHas("roles", builder => {
      builder.where("role_id", 1)
    })
    .first()
}
