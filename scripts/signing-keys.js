#!/usr/bin/node
import signatures from '../signatures.js'
const newKeys = signatures.keys()
console.log('Public: ' + newKeys.publicKey)
console.log('Private: ' + newKeys.privateKey)
