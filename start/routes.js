"use strict"

const Route = use("Route")

Route.on("/").render("welcome")

Route.get("/docs", "DocumentController.index")

require("./routing/dev")
require("./routing/prod")
