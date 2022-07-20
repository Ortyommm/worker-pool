const { isMainThread, parentPort, workerData } = require('worker_threads')
const crypto = require('crypto')
const util = require('util')
const workerDecorator = require('../../lib/workerDecorator.js')

if (isMainThread) {
  throw new Error('Script must be executed as a worker')
}

parentPort.on('message', workerDecorator(processData))

async function processData(data) {
  // console.log("was here", data);
  const password = (
    await util.promisify(crypto.pbkdf2)(data, 'salt', 1000000, 64, 'sha512')
  ).toString('hex')

  this.postMessage(password)
}
