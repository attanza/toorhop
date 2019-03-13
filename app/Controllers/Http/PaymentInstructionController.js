"use strict"

const PaymentInstruction = use("App/Models/PaymentInstruction")
const { ResponseParser, ErrorLog } = use("App/Helpers")
const { ActivityTraits } = use("App/Traits")
const Database = use("Database")
const fillable = ["midtrans_payment_id", "name", "content"]

/**
 * PaymentInstructionController
 *
 */

class PaymentInstructionController {
  /**
   * Index
   * Get List of PaymentInstructions
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

      const data = await PaymentInstruction.query()
        .where(function() {
          if (search && search != "") {
            this.where("name", "like", `%${search}%`)
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
   * Store New PaymentInstructions
   *
   */
  async store({ request, response, auth }) {
    try {
      let body = request.only(fillable)
      // Validate midtrans payment id exists
      const row = await Database.table("midtrans_payments")
        .where("id", body.midtrans_payment_id)
        .first()
      if (!row) {
        return response
          .status(422)
          .send(
            ResponseParser.apiValidationFailed("Midtrans payment not exists")
          )
      }
      const data = await PaymentInstruction.create(body)
      const activity = `Add new Midtrans Payment Instruction '${data.name}'`
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
   * PaymentInstruction by id
   */
  async show({ request, response }) {
    try {
      const id = request.params.id
      const data = await PaymentInstruction.find(id)
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
   * Update PaymentInstruction by Id
   */
  async update({ request, response, auth }) {
    try {
      let body = request.only(fillable)
      // Validate midtrans payment id exists
      const row = await Database.table("midtrans_payments")
        .where("id", body.midtrans_payment_id)
        .first()
      if (!row) {
        return response
          .status(422)
          .send(
            ResponseParser.apiValidationFailed("Midtrans payment not exists")
          )
      }
      const id = request.params.id
      const data = await PaymentInstruction.find(id)
      if (!data || data.length === 0) {
        return response.status(400).send(ResponseParser.apiNotFound())
      }
      await data.merge(body)
      await data.save()
      const activity = `Update Midtrans Payment Instruction '${data.name}'`
      await ActivityTraits.saveActivity(request, auth, activity)
      let parsed = ResponseParser.apiUpdated(data.toJSON())
      return response.status(200).send(parsed)
    } catch (e) {
      const error = ErrorLog(request, e)
      return response.status(error.status).send({ meta: error.meta })
    }
  }

  /**
   * Delete
   * Delete PaymentInstruction by Id
   */
  async destroy({ request, response, auth }) {
    try {
      const id = request.params.id
      const data = await PaymentInstruction.find(id)
      if (!data) {
        return response.status(400).send(ResponseParser.apiNotFound())
      }

      const activity = `Delete Midtrans Payment Instruction '${data.name}'`
      await ActivityTraits.saveActivity(request, auth, activity)

      await data.delete()
      return response.status(200).send(ResponseParser.apiDeleted())
    } catch (e) {
      const error = ErrorLog(request, e)
      return response.status(error.status).send({ meta: error.meta })
    }
  }
}

module.exports = PaymentInstructionController
