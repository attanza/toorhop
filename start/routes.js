"use strict"

const Route = use("Route")

Route.get("/", "DocumentController.index")

Route.group(() => {
  Route.post("login", "AuthController.login")
})
  .prefix("api/v1")
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
        [["midtrans-payments.store"], ["can:create-midtrans-payment"]],
        [["midtrans-payments.update"], ["can:update-midtrans-payment"]],
        [["midtrans-payments.destroy"], ["can:delete-midtrans-payment"]]
      ])
    )
})
  .prefix("api/v1")
  .formats(["json"])
  .middleware(["auth:jwt"])
