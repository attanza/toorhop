"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const User = use("App/Models/User")
const { test, trait } = use("Test/Suite")("MidtransPayments")

trait("Test/ApiClient")
trait("DatabaseTransactions")
trait("Auth/Client")

const endpoint = "api/v1/midtrans-payments"

/**
 * List of MidtransPayment
 */

test("Unathorized cannot get MidtransPayment List", async ({ client }) => {
  const response = await client.get(endpoint).end()
  response.assertStatus(401)
})

test("Forbidden cannot get MidtransPayment List", async ({ client }) => {
  const user = await User.find(2)
  const response = await client
    .get(endpoint)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(403)
})

test("Authorized can get MidtransPayment List", async ({ client }) => {
  const user = await User.find(1)
  const response = await client
    .get(endpoint)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(200)
})

/**
 * Create MidtransPayment
 */

test("Unathorized cannot create MidtransPayment", async ({ client }) => {
  const response = await client
    .post(endpoint)
    .send(MidtransPaymentData())
    .end()
  response.assertStatus(401)
})

test("Forbidden cannot Create MidtransPayment", async ({ client, assert }) => {
  const user = await User.find(2)
  const data = MidtransPaymentData()
  const response = await client
    .post(endpoint)
    .loginVia(user, "jwt")
    .send(data)
    .end()
  response.assertStatus(403)
})

test("Authorized can Create MidtransPayment", async ({ client, assert }) => {
  const admin = await getAdmin()
  const data = MidtransPaymentData()
  const response = await client
    .post(endpoint)
    .loginVia(admin, "jwt")
    .send(data)
    .end()
  response.assertStatus(201)
  response.assertJSONSubset({
    data: {
      name: data.name,
      bank: data.bank
    }
  })

  let dbData = await MidtransPayment.findBy("name", data.name)
  dbData = dbData.toJSON()
  assert.isObject(dbData)
})

test("Cannot Create MidtransPayment with uncomplete data", async ({
  client
}) => {
  const user = await User.find(1)
  const response = await client
    .post(endpoint)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(422)
})

/**
 * Update MidtransPayment
 */

test("Unathorized cannot Update MidtransPayment", async ({ client }) => {
  const editing = await MidtransPayment.find(1)
  const response = await client
    .put(endpoint + "/" + editing.id)
    .send(MidtransPaymentData())
    .end()
  response.assertStatus(401)
})

test("Forbidden cannot Update MidtransPayment", async ({ client }) => {
  const user = await User.find(2)
  const editing = await MidtransPayment.find(1)
  const data = MidtransPaymentData()
  const response = await client
    .put(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .send(data)
    .end()
  response.assertStatus(403)
})

test("Authorized can Update MidtransPayment", async ({ client }) => {
  const admin = await getAdmin()
  const editing = await MidtransPayment.find(1)
  const data = MidtransPaymentData()
  const response = await client
    .put(endpoint + "/" + editing.id)
    .loginVia(admin, "jwt")
    .send(data)
    .end()
  response.assertStatus(200)
  response.assertJSONSubset({
    data: {
      name: data.name,
      bank: data.bank
    }
  })
})

test("Cannot Update unexisted MidtransPayment", async ({ client }) => {
  const admin = await getAdmin()
  const response = await client
    .put(endpoint + "/" + 35)
    .loginVia(admin, "jwt")
    .send(MidtransPaymentData())
    .end()
  response.assertStatus(400)
})

/**
 * Show MidtransPayment
 */

test("Unathorized cannot Show MidtransPayment", async ({ client }) => {
  const data = await MidtransPayment.find(1)
  const response = await client.get(endpoint + "/" + data.id).end()
  response.assertStatus(401)
})

test("Forbidden cannot Show MidtransPayment", async ({ client }) => {
  const user = await User.find(2)
  const editing = await MidtransPayment.find(1)
  const response = await client
    .get(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(403)
})

test("Authorized can Show MidtransPayment", async ({ client }) => {
  const user = await User.find(1)
  const editing = await MidtransPayment.find(1)
  const response = await client
    .get(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(200)
})

test("Cannot Show unexisted MidtransPayment", async ({ client }) => {
  const user = await User.find(1)
  const response = await client
    .get(endpoint + "/" + 35)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(400)
})

/**
 * Delete MidtransPayment
 */

test("Unathorized cannot Delete MidtransPayment", async ({ client }) => {
  const data = await MidtransPayment.find(1)
  const response = await client.delete(endpoint + "/" + data.id).end()
  response.assertStatus(401)
})

test("Forbidden cannot Delete MidtransPayment", async ({ client }) => {
  const user = await User.find(2)
  const editing = await MidtransPayment.find(1)
  const response = await client
    .delete(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(403)
})

test("Authorized can Delete MidtransPayment", async ({ client, assert }) => {
  const user = await User.find(1)
  const editing = await MidtransPayment.find(1)
  const response = await client
    .delete(endpoint + "/" + editing.id)
    .loginVia(user, "jwt")
    .end()
  response.assertStatus(200)

  let dbData = await MidtransPayment.findBy("name", editing.name)
  assert.isNull(dbData)
})

test("Cannot Delete unexisted MidtransPayment", async ({ client }) => {
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

function MidtransPaymentData() {
  return {
    name: "BRI Virtual Account",
    bank: "BRI",
    transaction_type: "Bank Transfer",
    payment_type: "bank_transfer"
  }
}

async function getAdmin() {
  return await User.query()
    .whereHas("roles", builder => {
      builder.where("role_id", 1)
    })
    .first()
}
