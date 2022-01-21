import http from 'http'
import runSeries from 'run-series'
import server from './server.js'
import simpleConcat from 'simple-concat'
import tap from 'tap'

const terms = [
  ['service', ['1.0.0']],
  ['seller', ['2.0.1']],
  ['privacy', ['1.1.0']],
  ['free', ['1.2.0']],
  ['paid', ['1.0.0']],
  ['deal', ['1.5.1']]
]

terms.forEach(testTerms)

function testTerms ([slug, versions]) {
  tap.test(slug, test => {
    server((port, close) => {
      runSeries(
        versions
          .map(version => done => {
            http.request({ path: `/${slug}/${version}`, port })
              .once('response', response => {
                test.equal(response.statusCode, 200, `${version}: 200`)
                done()
              })
              .end()
          })
          .concat(done => {
            http.request({ path: `/${slug}`, port })
              .once('response', response => {
                test.equal(response.statusCode, 303, 'index: 303')
                done()
              })
              .end()
          })
          .concat(done => {
            http.request({ path: `/${slug}/404.0.0`, port })
              .once('response', response => {
                test.equal(response.statusCode, 404, '404.0.0: 404')
                done()
              })
              .end()
          })
          .concat(done => {
            http.request({ path: `/${slug}/x/y/z`, port })
              .once('response', response => {
                test.equal(response.statusCode, 404, 'x/y/z: 404')
                done()
              })
              .end()
          }),
        () => {
          test.end()
          close()
        }
      )
    })
  })
}

tap.test('terms feed', test => {
  server((port, close) => {
    http.request({ path: '/deal/feed.xml', port })
      .once('response', response => {
        test.equal(response.headers['content-type'], 'application/atom+xml', 'Content-Type')
        simpleConcat(response, (error, buffer) => {
          test.error(error)
          test.ok(buffer.toString().includes('<?xml version="1.0" encoding="UTF-8"?>'), 'xml')
          close()
          test.end()
        })
      })
      .end()
  })
})
