"use strict"

const Model = use("Model")
const Env = use("Env")

class MidtransPayment extends Model {
  static boot() {
    super.boot()

    this.addTrait("@provider:Lucid/Slugify", {
      fields: {
        slug: "name"
      },
      strategy: "dbIncrement"
    })
  }

  getLogo() {
    if (this.logo) {
      return `${getBaseUrl()}${this.logo}`
    } else return ""
  }

  instructions() {
    return this.hasMany("App/Models/PaymentInstruction")
  }
}

module.exports = MidtransPayment

function getBaseUrl() {
  let environment = Env.get("NODE_ENV")
  if (environment === "production" || environment === "staging") {
    return Env.get("PRODUCTION_APP_URL")
  } else {
    return Env.get("APP_URL")
  }
}
