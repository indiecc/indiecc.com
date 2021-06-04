import tap from 'tap'
import { token as tokenExpired } from '../../expired.js'

tap.test('expired unknown token', test => {
  const token = {
    action: 'invalid action',
    created: new Date().toISOString()
  }
  test.strictEqual(tokenExpired(token), false, 'returns false')
  test.end()
})

tap.test('confirmation token expiration', test => {
  const action = 'confirm e-mail'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  test.strictEqual(tokenExpired({
    action, created: yesterday.toISOString()
  }), false, 'returns false')

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  test.strictEqual(tokenExpired({
    action, created: weekAgo.toISOString()
  }), true, 'returns true')
  test.end()
})
