"use strict"

const Route = use("Route")

Route.get("/", "DocumentController.index")

require("./routing/dev")
require("./routing/prod")
