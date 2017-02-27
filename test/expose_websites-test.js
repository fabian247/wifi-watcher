const buster = require('buster')
const app = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'

buster.testCase('get Decoded Packets', {
  'should return decoded packets': function () {
    return app.getDecodedPackets(filename)
    .then((res, err) => {
      console.log('Test: decoded %d packages.', res.packets.length)
      buster.assert.equals(5375, res.packets.length)
    })
  },
  'should reject promise if no file or empty file': function () {
    buster.assert.match(app.getDecodedPackets('')
    .then(() => {}), Promise.reject(new Error('Could not open file.')))
  }
})

buster.testCase('get Websites', {
  setUp: function () {
    this.decPackets = app.getDecodedPackets(filename)
  },
  'should return Websites': function () {
    var result
    return this.decPackets
    .then((res) => {
      result = res
    })
    .then((res) => {
      var promisedWebsites = app.getWebsites(result)
      console.log('Test Websites: ')
      console.log('dhosts: %d shosts: %d', promisedWebsites.dhosts.length, promisedWebsites.shosts.length)
      buster.assert.equals(5375, promisedWebsites.dhosts.length)
      buster.assert.equals(5375, promisedWebsites.shosts.length)
    })
  }
})
