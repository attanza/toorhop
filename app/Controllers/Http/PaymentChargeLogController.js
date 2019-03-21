"use strict"

const PaymentChargeLog = use("App/Models/PaymentChargeLog")
const { ResponseParser, ErrorLog } = use("App/Helpers")

/**
 * PaymentChargeLogController
 *
 */

class PaymentChargeLogController {
  /**
   * Index
   * Get List of PaymentChargeLogs
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
        sort_mode,
        user_id,
        midtrans_payment_id
      } = request.get()

      if (!page) page = 1
      if (!limit) limit = 10
      if (!sort_by) sort_by = "id"
      if (!sort_mode) sort_mode = "desc"

      const data = await PaymentChargeLog.query()
        .where(function() {
          if (search && search != "") {
            this.where("order_id", "like", `%${search}%`)
            this.orWhereHas("user", builder => {
              builder.where("name", "like", `%${search}%`)
            })
            this.orWhereHas("paymentType", builder => {
              builder.where("name", "like", `%${search}%`)
            })
            // this.orWhere("midtrans_payment_id", "like", `%${search}%`)
            // this.orWhere("order_id", "like", `%${search}%`)
          }

          if (search_by && search_query) {
            this.where(search_by, search_query)
          }

          if (user_id && user_id != "") {
            this.where("user_id", user_id)
          }

          if (midtrans_payment_id && midtrans_payment_id != "") {
            this.where("midtrans_payment_id", midtrans_payment_id)
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
}

module.exports = PaymentChargeLogController
