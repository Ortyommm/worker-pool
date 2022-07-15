const { isMainThread, parentPort, workerData } = require('worker_threads')
const crypto = require('crypto')
const util = require('util')

if (isMainThread) {
  throw new Error('Script must be executed as a worker')
}

parentPort.on('message', processData)

async function processData(data) {
  // console.log("was here", data);
  const password = (
    await util.promisify(crypto.pbkdf2)(data, 'salt', 1000000, 64, 'sha512')
  ).toString('hex')

  parentPort.postMessage({ password })
}
