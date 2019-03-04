"use strict";

const Route = use("Route");

Route.get("/", "DocumentController.index");

Route.group(() => {
  Route.post("login", "AuthController.login");
})
  .prefix("api/v1")
  .formats(["json"]);

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
    );
})
  .prefix("api/v1")
  .formats(["json"])
  .middleware(["auth:jwt"]);
