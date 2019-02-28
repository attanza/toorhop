'use strict'

const docs = require('../../../docs.json')

class DocumentController {
  async index({view}) {
    return view.render('docs.index', {
      docs
    })
  }
}

module.exports = DocumentController
