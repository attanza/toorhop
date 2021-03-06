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
}

module.exports = TransactionLogController
