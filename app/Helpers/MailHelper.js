"use strict"

const Mail = use("Mail")

const Env = use("Env")

const from = Env.get("MAIL_FROM")

const User = use("App/Models/User")

class MailHelper {
  async sendError(subject, e) {
    const data = { e }
    Mail.send("emails.errors_mail", data, message => {
      message
        .to("dani.lesmiadi@gmail.com")
        .from(from)
        .subject(subject)
    })
  }
}

module.exports = new MailHelper()
