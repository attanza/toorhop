"use strict";

const Role = use("App/Models/Role");
const Database = use("Database");
class RoleSeeder {
  async run() {
    await Database.raw("SET FOREIGN_KEY_CHECKS=0;");
    await Role.truncate();
    await Database.table("permissions").truncate();
    await Database.table("permission_role").truncate();
    await Database.table("permission_role").truncate();
    await Database.table("role_user").truncate();
    await Database.raw("SET FOREIGN_KEY_CHECKS=1;");
    const roles = ["Administrator", "Client"];
    for (let i = 0; i < roles.length; i++) {
      await Role.create({
        name: roles[i]
      });
    }
  }
}

module.exports = RoleSeeder;
