const HTMLParser = require('node-html-parser')
const config = require('./config')
const ora = require('ora')
const { getPromised, rmdir, mkdir, folderExists, askConfirmartion } = require('./utils')
const { getPaginationLength, getProductsForAmountOfPages, getQueryParamsString } = require('./parsers/catalog')
const { loadImagesForProducts } = require('./parsers/product')


const parser = async () => {
  console.log('\nStaring SOKOLOV parser...\n')

  if (folderExists(config.imagesFolder)) {
    const answer = await askConfirmartion('Images folder detected. Do you want to remove it and start new parsing?')
    
    if (!answer) {
      return
    } else {
      rmdir(config.imagesFolder)
    }
  }

  mkdir(config.imagesFolder)

  const spinner = ora('Getting pages count...').start()

  const html = HTMLParser.parse(await getPromised(`${config.url}${getQueryParamsString()}`))
  const pagesCount = getPaginationLength(html)

  spinner.succeed(`Found ${pagesCount} pages`)

  const products = await getProductsForAmountOfPages(pagesCount)

  await loadImagesForProducts(products)

  spinner.succeed('Done!')
}

parser()

