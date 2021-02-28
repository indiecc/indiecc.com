import pay from './pay.js'

export default async ({
  page,
  port,
  handle,
  project,
  name,
  email,
  users = 1,
  location = 'US-CA',
  number = '4242'.repeat(4),
  confirm = true,
  test
}) => {
  // Browse the project page.
  await page.goto(`http://localhost:${port}/~${handle}/${project}`)
  const buyForm = '#buyForm'
  // Fill in customer details.
  await page.fill(`${buyForm} input[name="name"]`, name)
  await page.fill(`${buyForm} input[name="email"]`, email)
  await page.fill(`${buyForm} input[name="location"]`, location)
  // Select users limit.
  await page.check(`#users${users}`)
  // Enter credit card information.
  await pay({ page, number })
  // Accept terms.
  await page.check(`${buyForm} input[name="terms"]`)
  // Click the buy button.
  await page.click(`${buyForm} button[type="submit"]`)
  if (confirm) await page.waitForSelector('.message')
  if (test) test.pass('bought license')
}
