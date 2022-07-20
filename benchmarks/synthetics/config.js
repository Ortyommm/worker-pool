const fs = require('fs')
const path = require('path')

const arr = (() =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, 'descending_array.txt')).toString()
  ))()

function processArray(arr, number) {
  // console.log({ arr });
  return arr
    .sort((a, b) => a - b)
    .map((el) => el ** 2)
    .map((el) => el / number)
    .map((el) => Math.round(el * Math.random()))
    .filter((el) => el % 3 === 0)
}

const count = 12

module.exports = { arr, processArray, count }
