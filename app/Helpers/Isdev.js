"use strict"

module.exports = (request) => {
  const url = request.url()
  const splitUrl = url.split("/")
  if (splitUrl[2] === "dev-v1") {
    return true
  }
  return false
}
