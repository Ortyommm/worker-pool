const { isMainThread, parentPort, workerData } = require('worker_threads')
const crypto = require('crypto')
const util = require('util')
const { processArray, arr } = require('./config.js')

if (isMainThread) {
  throw new Error('Script must be executed as a worker')
}

parentPort.on('message', processData)

function processData(number) {
  const array = processArray(arr, number)
  parentPort.postMessage(array)
}
