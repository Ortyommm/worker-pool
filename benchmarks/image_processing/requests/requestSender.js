const fs = require('fs')
const path = require('path')

const axios = require('axios')
const FormData = require('form-data')

const imageFile = fs.readFileSync(path.resolve(__dirname, 'test-image.jpg'))

const promises = []

console.time('Image processing')
for (let i = 0; i < 30; i++) {
  let data = new FormData()
  data.append('image', imageFile, 'image.jpg')

  promises.push(
    axios
      .post('http://localhost:3000', data, {
        headers: {
          'Content-Type': `multipart/form-data`,
        },
      })
      .then((response) => {
        return response
      })
      .catch((err) => console.error(err))
  )
}

Promise.all(promises).then(() => {
  console.timeEnd('Image processing')
})
