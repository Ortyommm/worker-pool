const fs = require('fs')
const path = require('path')

const axios = require('axios')
const FormData = require('form-data')

const promises = []

console.time('Password processing')
for (let i = 0; i < 100; i++) {
  promises.push(
    axios
      .post('http://localhost:3000', { password: `password${i}` })
      .then((response) => {
        return response
      })
      .catch((err) => console.error(err))
  )
}

Promise.all(promises).then(() => {
  console.timeEnd('Password processing')
})
