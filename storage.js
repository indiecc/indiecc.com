// Store Data

import fs from 'fs'
import locks from 'lock'
import path from 'path'
import pump from 'pump'
import split2 from 'split2'
import through2 from 'through2'

export const lock = locks.Lock()

export const account = simpleFiles('accounts')
export const order = simpleFiles('orders')

export const license = {
  mkdirp: done => fs.mkdir(
    path.join(process.env.DIRECTORY, 'licenses'),
    { recursive: true },
    done
  ),
  path: id => path.join(process.env.DIRECTORY, 'licenses', id)
}

export const project = simpleFiles('projects')
export const email = simpleFiles('emails')
export const token = simpleFiles('tokens')
export const session = simpleFiles('sessions')
export const showcase = simpleFiles('showcases')
export const stripeID = simpleFiles('stripeIDs')

export const signature = {
  record: ({ date, signature, orderID }, callback) => {
    lock('signatures', unlock => {
      callback = unlock(callback)
      fs.appendFile(
        path.join(process.env.DIRECTORY, 'signatures.csv'),
        [date, signature, orderID].join(','),
        callback
      )
    })
  },
  createReadStream: () => {
    return pump(
      fs.createReadStream(
        path.join(process.env.DIRECTORY, 'signatures.csv'),
        'utf8'
      ),
      split2(),
      through2.obj((chunk, _, done) => {
        const [date, signature, orderID] = chunk.split(',')
        done(null, { date, signature, orderID })
      })
    )
  }
}

account.confirm = (handle, callback) => {
  const properties = { confirmed: new Date().toISOString() }
  account.update(handle, properties, callback)
}

token.use = (id, callback) => {
  const file = token.filePath(id)
  lock(file, unlock => {
    callback = unlock(callback)
    token.readWithoutLocking(id, (error, record) => {
      /* istanbul ignore if */
      if (error) return callback(error)
      if (!record) return callback(null, null)
      token.deleteWithoutLocking(id, error => {
        /* istanbul ignore if */
        if (error) return callback(error)
        callback(null, record)
      })
    })
  })
}

function simpleFiles (subdirectory, options) {
  options = options || {}
  const serialization = options.serialization
  const filePath = id => path.join(process.env.DIRECTORY, subdirectory, id + '.json')
  return {
    create: (id, value, callback) => {
      lock(filePath(id), unlock => writeWithoutLocking(id, value, 'wx', unlock(callback)))
    },
    write: (id, value, callback) => {
      lock(filePath(id), unlock => writeWithoutLocking(id, value, 'w', unlock(callback)))
    },
    writeWithoutLocking,
    read: (id, callback) => {
      lock(filePath(id), unlock => readWithoutLocking(id, unlock(callback)))
    },
    readWithoutLocking,
    createRawReadStream: id => {
      return fs.createReadStream(filePath(id), 'utf8')
    },
    exists: (id, callback) => {
      fs.access(filePath(id), error => {
        if (error) {
          if (error.code === 'ENOENT') {
            return callback(null, false)
          }
          /* istanbul ignore next */
          return callback(error)
        }
        callback(null, true)
      })
    },
    update: (id, updater, callback) => {
      const file = filePath(id)
      lock(file, unlock => {
        callback = unlock(callback)
        readFile({ file, serialization }, (error, record) => {
          /* istanbul ignore if */
          if (error) return callback(error)
          if (!record) return callback(null, null)
          if (typeof updater === 'function') {
            updater(record, error => {
              if (error) return callback(error)
              write()
            })
          } else {
            Object.assign(record, updater)
            write()
          }
          function write () {
            writeFile({ file, data: record, serialization }, error => {
              /* istanbul ignore if */
              if (error) return callback(error)
              callback(null, record)
            })
          }
        })
      })
    },
    list: callback => {
      const directory = path.dirname(filePath('x'))
      fs.readdir(directory, (error, entries) => {
        /* istanbul ignore if */
        if (error) return callback(error)
        const ids = entries.map(entry => path.basename(entry, '.json'))
        callback(null, ids)
      })
    },
    delete: (id, callback) => {
      lock(filePath(id), unlock => deleteWithoutLocking(id, unlock(callback)))
    },
    deleteWithoutLocking,
    filePath
  }

  function writeWithoutLocking (id, value, flag, callback) {
    const file = filePath(id)
    const directory = path.dirname(file)
    fs.mkdir(directory, { recursive: true }, error => {
      /* istanbul ignore if */
      if (error) return callback(error)
      writeFile({ file, data: value, serialization, flag }, callback)
    })
  }

  function readWithoutLocking (id, callback) {
    readFile({ file: filePath(id), serialization }, callback)
  }

  function deleteWithoutLocking (id, callback) {
    fs.unlink(filePath(id), error => {
      if (error && error.code === 'ENOENT') return callback()
      /* istanbul ignore next */
      return callback(error)
    })
  }
}

function readFile (options, callback) {
  const file = options.file
  const serialization = options.serialization || JSON
  fs.readFile(file, (error, data) => {
    if (error) {
      if (error.code === 'ENOENT') return callback(null, null)
      /* istanbul ignore next */
      return callback(error)
    }
    let parsed
    try {
      parsed = serialization.parse(data)
    } catch (error) {
      /* istanbul ignore next */
      return callback(error)
    }
    return callback(null, parsed)
  })
}

function writeFile (options, callback) {
  const file = options.file
  const data = options.data
  const serialization = options.serialization || JSON
  const flag = options.flag || 'w'
  const stringified = serialization.stringify(data)
  fs.writeFile(file, stringified, { flag }, error => {
    if (error) {
      if (error.code === 'EEXIST') return callback(null, false)
      /* istanbul ignore next */
      return callback(error, false)
    }
    callback(null, true)
  })
}
