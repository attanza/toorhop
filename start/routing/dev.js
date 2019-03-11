"use strict"

const Route = use("Route")

Route.group(() => {
  Route.post("login", "AuthController.login")

  Route.post(
    "midtrans-notification-handler",
    "MidtransController.notificationHandle"
  )

  Route.post("token/create", "ClientController.createToken").validator(
    "CreateToken"
  )
})
  .prefix("api/dev-v1")
  .formats(["json"])

/**
 * Clients
 */

Route.group(() => {
  Route.get("token/extract", "ClientController.extract")
  Route.post("midtrans-charge", "MidtransController.charge").validator(
    "MidtransCharge"
  )
})
  .prefix("api/dev-v1")
  .middleware("client")
  .formats(["json"])

Route.group(() => {
  /**
   * Users
   */

  Route.resource("users", "UserController")
    .apiOnly()
    .validator(
      new Map([
        [["users.store"], ["StoreUser"]],
        [["users.update"], ["UpdateUser"]]
      ])
    )
    .middleware(
      new Map([
        [["users.index"], ["can:read-user"]],
        [["users.show"], ["can:read-user"]],
        [["users.store"], ["can:create-user"]],
        [["users.update"], ["can:update-user"]],
        [["users.destroy"], ["can:delete-user"]]
      ])
    )

  /**
   * Midtrans Payment
   */

  Route.resource("midtrans-payments", "MidtransPaymentController")
    .apiOnly()
    .validator(
      new Map([
        [["midtrans-payments.store"], ["StoreMidtransPayment"]],
        [["midtrans-payments.update"], ["UpdateMidtransPayment"]]
      ])
    )
    .middleware(
      new Map([
        [["midtrans-payments.index"], ["can:read-midtrans-payment"]],
        [["midtrans-payments.show"], ["can:read-midtrans-payment"]],
        [["midtrans-payments.store"], ["can:create-midtrans-payment"]],
        [["midtrans-payments.update"], ["can:update-midtrans-payment"]],
        [["midtrans-payments.destroy"], ["can:delete-midtrans-payment"]]
      ])
    )

  /**
   * Transaction Log
   */

  Route.get("transaction-logs", "TransactionLogController.index")
})
  .prefix("api/dev-v1")
  .formats(["json"])
  .middleware(["auth:jwt"])
