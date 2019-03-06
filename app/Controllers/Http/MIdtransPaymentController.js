"use strict"

const MidtransPayment = use("App/Models/MidtransPayment")
const { ResponseParser, ErrorLog } = use("App/Helpers")
const { ActivityTraits } = use("App/Traits")
const Helpers = use("Helpers")
const Drive = use("Drive")
const fillable = ["name", "bank", "transaction_type", "payment_type"]

/**
 * MidtransPaymentController
 *
 */

class MidtransPaymentController {
  /**
   * Index
   * Get List of MidtransPayments
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

      const data = await MidtransPayment.query()
        .where(function() {
          if (search && search != "") {
            this.where("name", "like", `%${search}%`)
            this.orWhere("bank", "like", `%${search}%`)
            this.orWhere("transaction_type", "like", `%${search}%`)
            this.orWhere("payment_type", "like", `%${search}%`)
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
  /**
   * Store
   * Store New MidtransPayments
   */
  async store({ request, response, auth }) {
    try {
      let body = request.only(fillable)
      const data = await MidtransPayment.create(body)
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
   * MidtransPayment by id
   */
  async show({ request, response }) {
    try {
      const id = request.params.id
      const data = await MidtransPayment.find(id)
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
   * Update MidtransPayment by Id
   */
  async update({ request, response, auth }) {
    try {
      let body = request.only(fillable)
      const id = request.params.id
      const data = await MidtransPayment.find(id)
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
   * Delete MidtransPayment by Id
   */
  async destroy({ request, response, auth }) {
    try {
      const id = request.params.id
      const data = await MidtransPayment.find(id)
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

module.exports = MidtransPaymentController
