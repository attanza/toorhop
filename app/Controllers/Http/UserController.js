"use strict";

const User = use("App/Models/User");
const Role = use("App/Models/Role");
const { ResponseParser, ErrorLog } = use("App/Helpers");
const { ActivityTraits } = use("App/Traits");
const randomstring = require("randomstring");

class UserController {
  /**
   * Index
   * Get List of Users
   */
  async index({ request, response }) {
    try {
      let {
        page,
        limit,
        search,
        search_by,
        search_query,
        between_date,
        start_date,
        end_date,
        sort_by,
        sort_mode
      } = request.get();

      if (!page) page = 1;
      if (!limit) limit = 10;
      if (!sort_by) sort_by = "id";
      if (!sort_mode) sort_mode = "desc";

      const data = await User.query()
        .with("roles")
        .where(function() {
          if (search && search != "") {
            this.where("username", "like", `%${search}%`);
            this.orWhere("client", "like", `%${search}%`);
          }

          if (search_by && search_query) {
            this.where(search_by, search_query);
          }

          if (between_date && start_date && end_date) {
            this.whereBetween(between_date, [start_date, end_date]);
          }
        })
        .orderBy(sort_by, sort_mode)
        .paginate(page, limit);

      let parsed = ResponseParser.apiCollection(data.toJSON());

      return response.status(200).send(parsed);
    } catch (e) {
      ErrorLog(request, e);
      return response.status(500).send(ResponseParser.unknownError());
    }
  }

  /**
   * Store
   * Create New User
   */

  async store({ request, response, auth }) {
    try {
      const { username, client, role_id, password } = request.post();
      const client_key = randomstring.generate({
        length: 12,
        charset: "alphabetic"
      });
      const secret = randomstring.generate({
        length: 40,
        charset: "hex"
      });
      const data = await User.create({
        username,
        client,
        client_key,
        secret,
        password
      });
      await this.attachRoles(data, [role_id]);
      await data.load("roles");

      const activity = `Add new User '${data.client}'`;
      await ActivityTraits.saveActivity(request, auth, activity);
      let parsed = ResponseParser.apiCreated(data.toJSON());
      return response.status(201).send(parsed);
    } catch (e) {
      ErrorLog(request, e);
      return response.status(500).send(ResponseParser.unknownError());
    }
  }

  /**
   * Show
   * Get User by ID
   */

  async show({ request, response }) {
    try {
      const id = request.params.id;
      const data = await User.find(id);
      if (!data) {
        return response.status(400).send(ResponseParser.apiNotFound());
      }
      await data.load("roles");
      let parsed = ResponseParser.apiItem(data.toJSON());
      return response.status(200).send(parsed);
    } catch (e) {
      ErrorLog(request, e);
      return response.status(500).send(ResponseParser.unknownError());
    }
  }

  /**
   * Update
   * Update User data by ID
   */

  async update({ request, response, auth }) {
    try {
      const id = request.params.id;
      const data = await User.find(id);
      if (!data) {
        return response.status(400).send(ResponseParser.apiNotFound());
      }
      const { username, client, role_id, is_active } = request.post();
      data.merge({
        username,
        client,
        is_active
      });
      await data.save();
      await this.attachRoles(data, [role_id]);
      await data.load("roles");
      const activity = `Update user '${data.client}'`;
      await ActivityTraits.saveActivity(request, auth, activity);
      let parsed = ResponseParser.apiUpdated(data.toJSON());
      return response.status(200).send(parsed);
    } catch (e) {
      console.log("e", e);
      ErrorLog(request, e);
      return response.status(500).send(ResponseParser.unknownError());
    }
  }

  /**
   * Delete
   * Delete User data by ID
   */

  async destroy({ request, response, auth }) {
    try {
      const id = request.params.id;
      const data = await User.find(id);
      if (!data) {
        return response.status(400).send(ResponseParser.apiNotFound());
      }

      const activity = `Delete User '${data.name}'`;
      await ActivityTraits.saveActivity(request, auth, activity);
      // Delete Relationship
      await data.tokens().delete();
      await data.roles().detach();
      await data.activities().delete();
      // Delete Data
      await data.delete();
      return response.status(200).send(ResponseParser.apiDeleted());
    } catch (e) {
      console.log("e", e);
      ErrorLog(request, e);
      return response.status(500).send(ResponseParser.unknownError());
    }
  }

  /**
   * Attach Users to User
   */

  async attachRoles(user, roles) {
    let confirmedRoles = [];
    for (let i = 0; i < roles.length; i++) {
      let data = await Role.find(roles[i]);
      if (data) confirmedRoles.push(data.id);
    }
    await user.roles().sync(confirmedRoles);
  }
}

module.exports = UserController;
