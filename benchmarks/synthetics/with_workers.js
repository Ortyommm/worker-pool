const path = require('path')
const fs = require('fs')

const express = require('express')

const WorkerPool = require('../../lib/WorkerPool.js')
const { benchPasswords } = require('./requests/requestSender.js')

const app = express()

app.use(express.json())

//TODO 1
const pool = new WorkerPool(1, path.resolve(__dirname, 'testWorker.js'))

function asyncWrapper(fn) {
  return (req, res, next) => {
    return Promise.resolve(fn(req))
      .then((result) => res.json(result))
      .catch((err) => next(err))
  }
}

app.post(
  '/',
  asyncWrapper(async (req, res) => {
    const result = await pool.run(req.body.number)
    return result[0]
  })
)

app.listen(3000, benchPasswords)
