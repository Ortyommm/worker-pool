const fs = require('fs')
const path = require('path')

const axios = require('axios')

function benchPasswords() {
  const promises = []

  console.time('Synth processing')
  for (let i = 0; i < 30; i++) {
    promises.push(
      axios
        .post('http://localhost:3000', { number: i })
        .then((response) => {
          return response
        })
        .catch((err) => console.error(err))
    )
  }

  return Promise.all(promises).then(() => {
    console.timeEnd('Synth processing')
  })
}

module.exports = { benchPasswords }
