"use strict";

const Role = use("App/Models/Role");
const Permission = use("App/Models/Permission");

class zLastSeeder {
  async run() {
    let permissions = await Permission.all();
    permissions = permissions.toJSON();
    let role = await Role.first();
    let permissionIds = [];
    for (let i = 0; i < permissions.length; i++) {
      permissionIds.push(permissions[i].id);
    }
    await role.permissions().sync(permissionIds);
  }
}

module.exports = zLastSeeder;
