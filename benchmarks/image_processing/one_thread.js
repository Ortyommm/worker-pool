const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const uploadsFolder = path.resolve(__dirname, 'uploads')

const upload = multer()
const app = express()

app.use(express.static(uploadsFolder))
app.use(express.json())

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
    // const result = pool.run(req.file)
    const { buffer, originalname } = req.file
    const webpName = originalname.split('.').slice(0, -1).join('') + '.webp'
    const uuid = crypto.randomUUID()
    const newFileName = `${uuid}-${webpName}`
    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(path.resolve(__dirname, 'uploads', newFileName))

    return { url: `http://127.0.0.1:3000/${newFileName}` }
  })
)

app.listen(3000)
