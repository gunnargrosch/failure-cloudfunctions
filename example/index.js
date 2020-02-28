'use strict'
const failureCloudFunctions = require('failure-cloudfunctions')
const fs = require('fs')
exports.handler = failureCloudFunctions((req, res) => {
  let message = 'Hello failureCloudFunctions!'
  res.status(200).send(message)
})
