const fs = require('fs')
const path = require('path')

const axios = require('axios')
const FormData = require('form-data')

const imagesCount = 30

const imageFiles = []
for (let i = 0; i < imagesCount; i++) {
  imageFiles.push(fs.readFileSync(path.resolve(__dirname, `${i}.jpg`)))
}

function benchImages() {
  const responses = []
  const promises = []

  console.time('Image processing')
  for (let i = 0; i < imagesCount; i++) {
    let data = new FormData()
    data.append('image', imageFiles[i % imagesCount], 'image.jpg')

    promises.push(
      axios
        .post('http://localhost:3000', data, {
          headers: {
            'Content-Type': `multipart/form-data`,
          },
          maxBodyLength: Infinity,
        })
        .then((response) => {
          responses.push(response.data)
          return response
        })
        .catch((err) => console.error(err))
    )
  }

  Promise.all(promises).then(() => {
    console.timeEnd('Image processing')
  })
}

module.exports = { benchImages }
