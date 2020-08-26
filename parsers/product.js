const HTMLParser = require('node-html-parser')
const ora = require('ora')

const config = require('../config')
const { getPromised, downloadImage } = require('../utils')

const getImageUrlFromProductPage = (html) => html.querySelector('.slider-for__img').getAttribute('data-src')

const loadImagesForProducts = (products) => new Promise(async (resolve, reject) => {
  let spinner = ora('Downloading product images...').start()

  try {
    for (product of products) {
      const { url, vendorCode } = product
      spinner.text = `(${products.indexOf(product) + 1}/${products.length}) Getting image for product #${vendorCode}...`

      const productPageHtml = HTMLParser.parse(await getPromised(`${config.host}${url}`))
      const productImageUrl = getImageUrlFromProductPage(productPageHtml)
      await downloadImage(productImageUrl, vendorCode)
    }

    spinner.succeed('Finished downloading product images!')
    resolve()
  } catch (err) {
    reject(err)
  }
})

module.exports = {
  loadImagesForProducts
}