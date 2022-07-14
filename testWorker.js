const { isMainThread, parentPort, workerData } = require('worker_threads')
const crypto = require('crypto')
const sharp = require('sharp')
const path = require('path')

if (isMainThread) {
  throw new Error('Script must be executed as a worker')
}

parentPort.on('message', processData)

async function processData(data) {
  // console.log("was here", data);
  if (!data) return
  const file = data
  const { buffer, originalname } = file
  const webpName = originalname.split('.').slice(0, -1).join('') + '.webp'
  const uuid = crypto.randomUUID()
  const newFileName = `${uuid}-${webpName}`
  await sharp(buffer)
    .webp({ quality: 80 })
    .toFile(path.resolve(__dirname, 'uploads', newFileName))

  parentPort.postMessage({ url: `http://127.0.0.1:3000/${newFileName}` })
}
