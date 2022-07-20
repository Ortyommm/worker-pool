const crypto = require('crypto')
const util = require('util')

const express = require('express')
const { benchPasswords } = require('./requests/requestSender.js')

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
    const password = (
      await util.promisify(crypto.pbkdf2)(
        req.body.password,
        'salt',
        1000000,
        64,
        'sha512'
      )
    ).toString('hex')

    return { password }
  })
)

app.listen(3000, benchPasswords)
