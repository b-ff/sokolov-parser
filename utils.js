const http = require('http')
const https = require('https')
const fs = require('fs')
const axios = require('axios')
const Confirm = require('prompt-confirm');


const config = require('./config')

const folderExists = (path) => fs.existsSync(path)

const mkdir = (path) => fs.mkdirSync(path, { recursive: true })

const rmdir = (path) => {
  try {
    fs.rmdirSync(path, { recursive: true })
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

const getPromised = (url) => new Promise((resolve, reject) => {
  const client = url.includes('https://') ? https : http
  client.get(url, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => resolve(data))
  }).on('error', (error) => reject(error))
})

const downloadImage = (url, filename) => axios({ url, responseType: 'stream' }).then(
  response => new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(`${config.imagesFolder}/${filename}.${config.imagesExtension}`))
      .on('finish', () => resolve())
      .on('error', e => reject(e))
  })
)

const askConfirmartion = (question) => new Confirm(question).run()

module.exports = {
  folderExists,
  mkdir,
  rmdir,
  getPromised,
  downloadImage,
  askConfirmartion
}