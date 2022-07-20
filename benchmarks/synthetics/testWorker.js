const { isMainThread, parentPort, workerData } = require('worker_threads')
const crypto = require('crypto')
const util = require('util')
const { processArray, arr } = require('./config.js')
const workerDecorator = require('../../lib/workerDecorator.js')

if (isMainThread) {
  throw new Error('Script must be executed as a worker')
}

parentPort.on('message', workerDecorator(processData))

function processData(number) {
  const array = processArray(arr, number)
  this.postMessage(array)
}
