const HTMLParser = require('node-html-parser')
const ora = require('ora')

const config = require('../config')
const { getPromised } = require('../utils')

const getPaginationLength = (html) => Array.from(html.querySelector('.pagination').querySelectorAll('a'))
  .map(linkElement => linkElement.text.toString().trim())
  .filter(linkText => linkText.match(/^\d+$/))
  .map(pageNumber => parseInt(pageNumber, 10))
  .concat()
  .pop()

const getProductDataFromElement = (productElement) => {
  const url = productElement.getAttribute('data-href')
  const vendorCode = productElement.getAttribute('data-urlcode')

  return {
    url, vendorCode
  }
}

const getQueryParamsString = (additionalParams = {}) => {
  const params = Object.assign({}, config.queryParams, additionalParams)
  return '?' + Object.keys(params)
    .map((paramName) => `${paramName}=${params[paramName]}`)
    .join('&')
}

const getProductsFromCatalogPage = (html) => {
  const products = Array.from(html.querySelectorAll('.product-item')).map(getProductDataFromElement)
  return products
}

const getProductsForAmountOfPages = (pagesCount = 1) => new Promise(async (resolve, reject) => {
  const spinner = ora('Parsing catalog pages...').start()

  let products = []

  try {
    const urls = (new Array(pagesCount))
      .fill()
      .map((item, idx) => {
        const queryParams = getQueryParamsString({[config.paginationParameter]: idx + 1})
        return `${config.url}${queryParams}`
      })

    for (const url of urls) {
      const page = HTMLParser.parse(await getPromised(url))
      products = products.concat(getProductsFromCatalogPage(page))
      spinner.text = `Parsing ${urls.indexOf(url) + 1} of ${pagesCount} product pages, found ${products.length} product(s)...`
    }

    spinner.succeed(`Parsed ${pagesCount} catalog pages, found ${products.length} product(s)`)
    resolve(products)
  } catch (err) {
    spinner.fail('Failed parsing catalog pages!')
    reject(err)
  }
})

module.exports = {
  getPaginationLength,
  getProductsFromCatalogPage,
  getProductsForAmountOfPages,
  getQueryParamsString
}