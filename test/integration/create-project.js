import assert from 'assert'

export default async ({
  page,
  port,
  project,
  tagline = 'just a test',
  pitch = 'a simple _test_ project',
  language = 'C',
  urls = [
    `https://github.com/example/${project}`,
    `http://example.com/${project}`
  ],
  prices = [10, 50, 100, 500],
  category = 'library'
}) => {
  assert(page)
  assert(Number.isSafeInteger(port))
  assert(typeof project === 'string')
  assert(Array.isArray(prices))
  assert(prices.every(price => typeof price === 'number'))
  assert(typeof category === 'string')
  await page.goto('http://localhost:' + port)
  await page.click('#account')
  await page.click('"Create Project"')
  const createForm = '#createForm'
  await page.fill(`${createForm} input[name="project"]`, project)
  await page.fill(`${createForm} input[name="tagline"]`, tagline)
  await page.fill(`${createForm} textarea[name="pitch"]`, pitch)
  const urlInputs = await page.$$('input[name="urls"]')
  for (let index = 0; index < urls.length; index++) {
    await urlInputs[index].fill(urls[index])
  }
  const pricesInputs = await page.$$('input[name="prices"]')
  for (let index = 0; index < pricesInputs.length; index++) {
    await pricesInputs[index].fill(prices[index].toString())
  }
  await page.selectOption(`${createForm} select[name="language"]`, language)
  await page.selectOption(`${createForm} select[name="category"]`, category)
  await page.click(`${createForm} input[name=terms]`)
  await page.click(`${createForm} button[type="submit"]`)
}
