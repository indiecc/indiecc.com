import http from 'http'
import parse5 from 'parse5'
import runSeries from 'run-series'
import server from './server.js'
import simpleConcat from 'simple-concat'
import * as storage from '../../storage.js'
import tap from 'tap'

tap.test('homepage', test => {
  const handle = 'test'
  const project = 'test'
  server((port, close) => {
    runSeries([
      done => storage.showcase.write('homepage', [
        { handle, project }
      ], done),
      done => storage.project.write(`${handle}/${project}`, {
        project,
        handle,
        urls: ['http://example.com'],
        prices: [10, 50, 100, 500],
        tiers: [1, 5, 10, 100],
        badges: {},
        category: 'library',
        created: new Date().toISOString()
      }, done)
    ], error => {
      test.error(error, 'no error')
      http.request({ port })
        .once('response', response => {
          simpleConcat(response, (error, buffer) => {
            test.error(error, 'no concat error')
            const string = buffer.toString()
            test.doesNotThrow(() => parse5.parse(string), 'valid HTML5')
            test.ok(
              string.includes(`href=/~${handle}/${project}`),
              'links to showcased'
            )
            test.end()
            close()
          })
        })
        .end()
    })
  })
})
