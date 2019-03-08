"use strict"

const TransactionLog = use("App/Models/TransactionLog")
const { ResponseParser, ErrorLog } = use("App/Helpers")
const { ActivityTraits } = use("App/Traits")
const fillable = [
  "status_code",
  "transaction_id",
  "order_id",
  "fraud_status",
  "transaction_status"
]

/**
 * TransactionLogController
 *
 */

class TransactionLogController {
  /**
   * Index
   * Get List of TransactionLogs
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
      } = request.get()

      if (!page) page = 1
      if (!limit) limit = 10
      if (!sort_by) sort_by = "id"
      if (!sort_mode) sort_mode = "desc"

      const data = await TransactionLog.query()
        .where(function() {
          if (search && search != "") {
            this.where("status_code", "like", `%${search}%`)
            this.orWhere("transaction_id", "like", `%${search}%`)
            this.orWhere("order_id", "like", `%${search}%`)
            this.orWhere("fraud_status", "like", `%${search}%`)
            this.orWhere("transaction_status", "like", `%${search}%`)
          }

          if (search_by && search_query) {
            this.where(search_by, search_query)
          }

          if (between_date && start_date && end_date) {
            this.whereBetween(between_date, [start_date, end_date])
          }
        })
        .orderBy(sort_by, sort_mode)
        .paginate(page, limit)

      let parsed = ResponseParser.apiCollection(data.toJSON())
      return response.status(200).send(parsed)
    } catch (e) {
      const error = ErrorLog(request, e)
      return response.status(error.status).send({ meta: error.meta })
    }
  }

  // TODO: Complete rest of CrUD
  /**
   * Store
   * Store New TransactionLogs
   *
   */
  async store({ request, response, auth }) {
    try {
      let body = request.only(fillable)
      const data = await TransactionLog.create(body)
      await this.uploadLogo(request, data)
      const activity = `Add new Midtrans Payment '${data.slug}'`
      await ActivityTraits.saveActivity(request, auth, activity)
      let parsed = ResponseParser.apiCreated(data.toJSON())
      return response.status(201).send(parsed)
    } catch (e) {
      const error = ErrorLog(request, e)
      return response.status(error.status).send({ meta: error.meta })
    }
  }

  /**
   * Show
   * TransactionLog by id
   */
  async show({ request, response }) {
    try {
      const id = request.params.id
      const data = await TransactionLog.find(id)
      if (!data) {
        return response.status(400).send(ResponseParser.apiNotFound())
      }
      let parsed = ResponseParser.apiItem(data.toJSON())
      return response.status(200).send(parsed)
    } catch (e) {
      const error = ErrorLog(request, e)
      return response.status(error.status).send({ meta: error.meta })
    }
  }

  /**
   * Update
   * Update TransactionLog by Id
   */
  async update({ request, response, auth }) {
    try {
      let body = request.only(fillable)
      const id = request.params.id
      const data = await TransactionLog.find(id)
      if (!data || data.length === 0) {
        return response.status(400).send(ResponseParser.apiNotFound())
      }
      await data.merge(body)
      await data.save()
      const activity = `Update Midtrans Payment '${data.slug}'`
      await ActivityTraits.saveActivity(request, auth, activity)
      await this.uploadLogo(request, data)
      let parsed = ResponseParser.apiUpdated(data.toJSON())
      return response.status(200).send(parsed)
    } catch (e) {
      const error = ErrorLog(request, e)
      return response.status(error.status).send({ meta: error.meta })
    }
  }

  /**
   * Delete
   * Delete TransactionLog by Id
   */
  async destroy({ request, response, auth }) {
    try {
      const id = request.params.id
      const data = await TransactionLog.find(id)
      if (!data) {
        return response.status(400).send(ResponseParser.apiNotFound())
      }

      if (data.logo) {
        let exists = await Drive.exists(Helpers.publicPath(data.logo))
        if (exists) {
          await Drive.delete(Helpers.publicPath(data.logo))
        }
      }

      const activity = `Delete Midtrans Payment '${data.slug}'`
      await ActivityTraits.saveActivity(request, auth, activity)

      await data.delete()
      return response.status(200).send(ResponseParser.apiDeleted())
    } catch (e) {
      const error = ErrorLog(request, e)
      return response.status(error.status).send({ meta: error.meta })
    }
  }

  /**
   * @param {file} logo
   * @returns Midtrans Payment data
   */

  async uploadLogo(request, midatransData) {
    try {
      const logo = request.file("logo", {
        types: ["image"],
        size: "5mb"
      })

      if (!logo) {
        return
      }
      const name = `${new Date().getTime()}.${logo.subtype}`

      await logo.move(Helpers.publicPath("img/bank_logos"), { name })

      if (!logo.moved()) {
        throw { message: "logo failed to upload", status: 400 }
      }
      await midatransData.merge({ logo: `/img/bank_logos/${name}` })
      await midatransData.save()
      const activity = `Upload Midtrans Payment logo '${data.slug}'`
      await ActivityTraits.saveActivity(request, auth, activity)
      return midatransData
    } catch (e) {
      throw e
    }
  }
}

module.exports = TransactionLogController
