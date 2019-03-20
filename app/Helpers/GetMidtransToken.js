"use strict"

const Env = use("Env")
const url = Env.get("MIDTRANS_DEV_URL") + "/token"
const key = Env.get("MIDTRANS_DEV_CLIENT_KEY")
const axios = require("axios")

module.exports = async tokenData => {
  const endPoint = `${url}?client_key=${key}&gross_amount=${
    tokenData.gross_amount
  }&card_number=${tokenData.card_number}&card_exp_month=${
    tokenData.card_exp_month
  }&card_exp_year=${tokenData.card_exp_year}&card_cvv=${
    tokenData.card_cvv
  }&secure=true&bank=bca`
  return await axios.get(endPoint).then(res => res.data)
}
