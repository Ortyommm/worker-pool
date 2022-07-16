const fs = require('fs')
const path = require('path')

const axios = require('axios')

function benchPasswords() {
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

  return Promise.all(promises).then(() => {
    console.timeEnd('Password processing')
  })
}

module.exports = { benchPasswords }
