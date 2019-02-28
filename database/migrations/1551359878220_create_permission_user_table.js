"use strict";

const Schema = use("Schema");

class PermissionUserTableSchema extends Schema {
  up() {
    this.create("permission_user", table => {
      table.increments();
      table
        .integer("permission_id")
        .unsigned()
        .index();
      table
        .integer("user_id")
        .unsigned()
        .index();
      table.timestamps();
    });
  }

  down() {
    this.drop("permission_user");
  }
}

module.exports = PermissionUserTableSchema;
