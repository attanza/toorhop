"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class ActivitySchema extends Schema {
  up() {
    this.create("activities", table => {
      table.increments();
      table.integer("user_id").unsigned();
      table.string("ip", 20);
      table.string("browser");
      table.string("activity");
      table.timestamps();
    });
  }

  down() {
    this.drop("activities");
  }
}

module.exports = ActivitySchema;
