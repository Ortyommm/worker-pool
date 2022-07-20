const crypto = require('crypto')
const util = require('util')

const express = require('express')
const { benchPasswords } = require('./requests/requestSender.js')
const { processArray, arr } = require('./config.js')

const app = express()

app.use(express.json())

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
    const array = processArray(arr, req.body.number)
    return { array: arr[0] }
  })
)

app.listen(3000, benchPasswords)
