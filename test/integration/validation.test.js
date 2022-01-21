import tap from 'tap'
import * as validation from '../../validation.js'

tap.test('handle validation', test => {
  const valid = [
    'kemitchell',
    'kyle_mitchell',
    'kyle-mitchell',
    'ten10'
  ]
  const invalid = [
    'Кайл',
    'kyle--mitchell',
    'kyle-_mitchell'
  ]
  const validate = validation.handles.validate
  valid.forEach(example => {
    test.ok(validate(example), `"${example}" valid`)
  })
  invalid.forEach(example => {
    test.ok(!validate(example), `"${example}" invalid`)
  })
  test.end()
})

tap.test('project name validation', test => {
  const valid = [
    'superlibrary',
    'framework10',
    'test-framework',
    'test_framework',
    '_underscore'
  ]
  const invalid = [
    '...'
  ]
  const validate = validation.projects.validate
  valid.forEach(example => {
    test.ok(validate(example), `"${example}" valid`)
  })
  invalid.forEach(example => {
    test.ok(!validate(example), `"${example}" invalid`)
  })
  test.end()
})

tap.test('password validation', test => {
  const valid = [
    'not very secure'
  ]
  const invalid = [
    'short'
  ]
  const validate = validation.passwords.validate
  valid.forEach(example => {
    test.ok(validate(example), `"${example}" valid`)
  })
  invalid.forEach(example => {
    test.ok(!validate(example), `"${example}" invalid`)
  })
  test.end()
})
