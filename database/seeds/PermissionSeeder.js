"use strict";

const changeCase = require("change-case");
const Permission = use("App/Models/Permission");
const resources = ["User"];
const actions = ["create", "read", "update", "delete"];
const Database = use("Database");

class PermissionSeeder {
  async run() {
    await Database.raw("SET FOREIGN_KEY_CHECKS=0;");
    await Permission.truncate();
    await Database.raw("SET FOREIGN_KEY_CHECKS=1;");
    for (let i = 0; i < resources.length; i++) {
      for (let j = 0; j < actions.length; j++) {
        let body = {
          name: changeCase.sentenceCase(actions[j] + " " + resources[i])
        };
        await Permission.create(body);
      }
    }
  }
}

module.exports = PermissionSeeder;
