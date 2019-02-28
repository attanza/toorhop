"use strict";

const User = use("App/Models/User");
const Role = use("App/Models/Role");
const { RedisHelper, ResponseParser } = use("App/Helpers");
const randomstring = require("randomstring");
const Env = use("Env");
const { ActivityTraits } = use("App/Traits");
const mongodb = require("mongodb");

const fillable = ["provider", "is_active", "role_id"];

class UserController {
  async index({ request, response }) {
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

    if (search && search != "") {
      const data = await User.with("role")
        .where({
          $or: [
            { client: { $regex: search, $options: "i" } },
            { client_key: { $regex: search, $options: "i" } }
          ]
        })
        .paginate(parseInt(page), parseInt(limit));
      let parsed = ResponseParser.apiCollection(data.toJSON());
      return response.status(200).send(parsed);
    }

    const redisKey = `User_${page}${limit}${sort_by}${sort_mode}${search_by}${search_query}${between_date}${start_date}${end_date}`;

    let cached = await RedisHelper.get(redisKey);

    if (cached) {
      return response.status(200).send(cached);
    }

    const data = await User.query()
      .with("role")
      .where(function() {
        if (search_by && search_query) {
          return this.where({ search_by: { $regex: search, $options: "i" } });
        }
      })
      .where(function() {
        if (between_date && start_date && end_date) {
          return this.whereBetween(between_date, [start_date, end_date]);
        }
      })
      .orderBy(sort_by, sort_mode)
      .paginate(parseInt(page), parseInt(limit));

    let parsed = ResponseParser.apiCollection(data.toJSON());
    await RedisHelper.set(redisKey, parsed);
    return response.status(200).send(parsed);
  }

  async store({ request, response, auth }) {
    let { provider } = request.post();
    const provider_key = randomstring.generate({
      length: 12,
      charset: "alphanumeric"
    });

    // Get Role
    let role_id;
    const clientRole = await Role.findBy("slug", "client");
    if (clientRole) {
      role_id = clientRole._id;
    }
    const secret = randomstring.generate({ length: 40, charset: "hex" });
    const username = provider_key + secret;
    const password = provider_key + Env.get("APP_KEY") + secret;
    const data = await User.create({
      provider,
      provider_key,
      secret,
      username,
      password,
      is_active: true,
      role_id
    });
    await RedisHelper.delete("Users_*");
    const activity = `Add new Provider '${data.provider}'`;
    await ActivityTraits.saveActivity(request, auth, activity);
    let parsed = ResponseParser.apiCreated(data.toJSON());
    return response.status(201).send(parsed);
  }

  /**
   * Display a single User.
   * GET User/:id
   */
  async show({ request, response }) {
    const id = request.params.id;
    let redisKey = `User_${id}`;
    let cached = await RedisHelper.get(redisKey);
    if (cached) {
      return response.status(200).send(cached);
    }
    const data = await User.find(id);
    await data.load("role");
    if (!data) {
      return response.status(400).send(ResponseParser.apiNotFound());
    }
    let parsed = ResponseParser.apiItem(data.toJSON());
    await RedisHelper.set(redisKey, parsed);
    return response.status(200).send(parsed);
  }

  /**
   * Update User details.
   * PUT or PATCH User/:id
   */
  async update({ auth, request, response }) {
    try {
      let body = request.only(fillable);
      if (body.role_id) {
        await this.validateRoleId(body.role_id);
      }
      const id = request.params.id;
      const data = await User.find(id);
      if (!data || data.length === 0) {
        return response.status(400).send(ResponseParser.apiNotFound());
      }
      await data.merge(body);
      await data.save();
      await data.load("role");
      const activity = `Update Provider '${data.provider}'`;
      await ActivityTraits.saveActivity(request, auth, activity);
      await RedisHelper.delete("User_*");
      let parsed = ResponseParser.apiUpdated(data.toJSON());
      return response.status(200).send(parsed);
    } catch (e) {
      console.log("e", e); //eslint-disable-line
      return response
        .status(400)
        .send(ResponseParser.errorResponse("Update failed"));
    }
  }

  /**
   * Delete a User with id.
   * DELETE User/:id
   */
  async destroy({ auth, request, response }) {
    const id = request.params.id;
    const data = await User.find(id);
    if (!data) {
      return response.status(400).send(ResponseParser.apiNotFound());
    }
    const activity = `Delete Provider '${data.provider}'`;
    await ActivityTraits.saveActivity(request, auth, activity);
    await RedisHelper.delete("User*");
    await data.tokens().delete();
    await data.delete();
    return response.status(200).send(ResponseParser.apiDeleted());
  }

  async me({ auth, response }) {
    let user = await auth.getUser();
    return response.status(200).send(ResponseParser.apiItem(user.toJSON()));
  }

  /**
   * Validate Role Id
   */

  async validateRoleId(id) {
    if (!mongodb.ObjectID.isValid(id)) {
      throw "Invalid mongo id";
    }

    const role = await Role.find(id);
    if (!role) {
      throw "Role not found";
    }
  }
}

module.exports = UserController;
