const buster = require('buster')
const app = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'

buster.testCase('get Decoded Packets', {
  'should return decoded packets': function () {
    return app.getDecodedPackets(filename)
    .then((res) => {
      console.log(res.packets.length)
      buster.assert.equals(5375, res.packets.length)
    })
  }
})

buster.testCase('get Websites', {
  setUp: function () {
    this.decPackets = app.getDecodedPackets(filename)
  },
  'should return Websites': function () {
    return app.getWebsites(this.decPackets)
    .then((res) => {
      console.log(res.packets.length)
      buster.assert.equals(5375, res.packets.length)
    })
  }
})
