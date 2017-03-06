const buster = require('buster')
const app = require('../lib/startCapture')
const config = require('../../config.json')

buster.testCase('get Stream from fritzbox', {
  '//should start bash script to download from fritzbox': function () {
    console.log('Test', config)
    buster.assert.match(app.getCaptureFromFitzbox(config), 'challenge found')
  }
})
