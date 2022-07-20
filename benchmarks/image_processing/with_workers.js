const path = require('path')
const fs = require('fs')

const express = require('express')
const multer = require('multer')

const WorkerPool = require('../../lib/WorkerPool.js')
const { benchImages } = require('./requests/requestSender.js')

const uploadsFolder = path.resolve(__dirname, 'uploads')

const upload = multer()
const app = express()

app.use(express.static(uploadsFolder))
app.use(express.json())

// console.log(os.cpus().length)
const pool = new WorkerPool(12, path.resolve(__dirname, 'testWorker.js'))

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder)
}

function asyncWrapper(fn) {
  return (req, res, next) => {
    return Promise.resolve(fn(req))
      .then((result) => res.json(result))
      .catch((err) => next(err))
  }
}

app.post(
  '/',
  upload.single('image'),
  asyncWrapper(async (req, res) => {
    const result = await pool.run(req.file)
    return result
  })
)
// longpool
// id
app.listen(3000, benchImages)
