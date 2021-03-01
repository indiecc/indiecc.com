import http from 'http'
import server from './server.js'
import tap from 'tap'

tap.test('GET /buy', test => {
  server((port, close) => {
    http.request({
      method: 'GET',
      path: '/buy',
      port
    })
      .once('response', response => {
        test.equal(response.statusCode, 405, '405')
        test.end()
        close()
      })
      .end()
  })
})

tap.test('POST /buy without body', test => {
  server((port, close) => {
    http.request({
      method: 'POST',
      path: '/buy',
      port
    })
      .once('response', response => {
        test.equal(response.statusCode, 400, '400')
        test.end()
        close()
      })
      .end()
  })
})
