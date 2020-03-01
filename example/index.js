'use strict'
const failureCloudFunctions = require('failure-cloudfunctions')
const fs = require('fs')

exports.handler = failureCloudFunctions(async (req, res) => {
  try {
    fs.writeFile(process.env.TMP + '/example-' + Date.now() + '.tmp', 'Contents', (err) => {
      if (err) throw err
    })
    let response = 'Hello failureCloudFunctions!'
    res.status(200).send(response)
  } catch (err) {
    res.status(400).send('Error!')
  }
})
