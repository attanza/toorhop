"use strict"

const Route = use("Route")

Route.group(() => {
  Route.post("login", "AuthController.login")

  Route.post(
    "midtrans-notification-handler",
    "MidtransController.notificationHandle"
  )
})
  .prefix("api/v1")
  .formats(["json"])

/**
 * Clients
 * Use Client Middleware
 */

Route.group(() => {
  Route.get("midtrans-payment-list", "MidtransPaymentController.index")
  Route.post("midtrans-charge", "MidtransController.charge").validator(
    "MidtransCharge"
  )
})
  .prefix("api/v1")
  .middleware("client")
  .formats(["json"])

/**
 * Manage
 */

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
  .prefix("api/v1")
  .formats(["json"])
  .middleware(["auth:jwt"])