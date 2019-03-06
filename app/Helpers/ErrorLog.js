const Env = use("Env")
const ErrorLog = use("App/Models/ErrorLog")
const MailHelper = require("./MailHelper")
module.exports = async (request, e) => {
  const NODE_ENV = Env.get("NODE_ENV")
  if (NODE_ENV === "production") {
    await ErrorLog.create({
      url: request.url(),
      method: request.method(),
      error: e.message
    })
    const subject = `toorhop error: ${request.method()} ${request.url()}`
    MailHelper.sendError(subject, e)
  }

  if (e.response) {
    let error = e.response
    if (error.status === 400 && error.data.meta) {
      const { message } = error.data.meta
      return parseError(400, message)
    } else if (error.status === 400 && error.data.error_description) {
      return parseError(400, error.data.error_description)
    } else if (error.status === 401) {
      return parseError(401, "Unathorized")
    } else {
      if (error.hasOwnProperty("data") && error.data.hasOwnProperty("meta")) {
        return parseError(400, error.data.meta.message)
      }
      return parseError(500, "Internal server error")
    }
  } else {
    return parseError(400, e.message)
  }
}
function parseError(status, message) {
  let meta = {
    status,
    message
  }
  return { status, meta }
}
