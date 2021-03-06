'use strict'
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager')
const projectName = process.env["GCP_PROJECT"]
const secretName = process.env["FAILURE_INJECTION_PARAM"]
const fullSecretName = 'projects/' + projectName + '/secrets/' + secretName + '/versions/latest'
const client = new SecretManagerServiceClient();
const childProcess = require('child_process')
const Mitm = require('mitm')

async function getConfig() {
  try {
    const [version] = await client.accessSecretVersion({
      name: fullSecretName,
    })
    const request = version.payload.data.toString('utf8')
    return request
  } catch (err) {
    console.error(err)
    throw err
  }
}
var injectFailure = function (fn) {
  return async function () {
    try {
      let configResponse = await getConfig()
      let config = JSON.parse(configResponse)
      if (config.isEnabled === true && Math.random() < config.rate) {
        if (config.failureMode === 'latency') {
          let latencyRange = config.maxLatency - config.minLatency
          let setLatency = Math.floor(config.minLatency + Math.random() * latencyRange)
          console.log('Injecting ' + setLatency + ' ms latency.')
          await new Promise(resolve => setTimeout(resolve, setLatency))
        } else if (config.failureMode === 'exception') {
          console.log('Injecting exception message: ' + config.exceptionMsg)
          throw new Error(config.exceptionMsg)
        } else if (config.failureMode === 'statuscode') {
          console.log('Injecting status code: ' + config.statusCode)
          let res = { status: config.statusCode }
          return res
        } else if (config.failureMode === 'diskspace') {
          console.log('Injecting disk space: ' + config.diskSpace + ' MB')
          childProcess.spawnSync('dd', ['if=/dev/zero', 'of=/tmp/diskspace-failure-' + Date.now() + '.tmp', 'count=1000', 'bs=' + config.diskSpace * 1000])
        } else if (config.failureMode === 'denylist') {
          console.log('Injecting dependency failure through a network block for denylisted sites: ' + config.denylist)
          let mitm = Mitm()
          let blRegexs = []
          config.denylist.forEach(function (regexStr) {
            blRegexs.push(new RegExp(regexStr))
          })
          mitm.on('connection', function (socket, opts) {
            let block = false
            blRegexs.forEach(function (blRegex) {
              if (blRegex.test(opts.host)) {
                console.log('Intercepted network connection to ' + opts.host)
                block = true
              }
            })
            if (block) {
              socket.end()
            } else {
              socket.bypass()
            }
          })
        }
      }
      return fn.apply(this, arguments)
    } catch (ex) {
      console.log(ex)
      throw ex
    }
  }
}

module.exports = injectFailure
