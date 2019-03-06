"use strict"

const changeCase = require("change-case")
const Permission = use("App/Models/Permission")
const resources = ["User", "Midtrans Payment"]
const actions = ["create", "read", "update", "delete"]
const Database = use("Database")

class PermissionSeeder {
  async run() {
    await Permission.truncate()
    for (let i = 0; i < resources.length; i++) {
      for (let j = 0; j < actions.length; j++) {
        let body = {
          name: changeCase.sentenceCase(actions[j] + " " + resources[i])
        }
        await Permission.create(body)
      }
    }
  }
}

module.exports = PermissionSeeder
