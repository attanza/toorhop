"use strict";

const Role = use("App/Models/Role");
const Database = use("Database");
class RoleSeeder {
  async run() {
    await Role.truncate();
    await Database.table("permission_role").truncate();
    await Database.table("role_user").truncate();
    const roles = ["Administrator", "Client"];
    for (let i = 0; i < roles.length; i++) {
      await Role.create({
        name: roles[i]
      });
    }

    await Database.table("role_user").insert({
      user_id: 1,
      role_id: 1
    });

    await Database.table("role_user").insert({
      user_id: 2,
      role_id: 2
    });
  }
}

module.exports = RoleSeeder;
