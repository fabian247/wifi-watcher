const buster = require('buster')
const app = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'

buster.testCase('get Decoded Packets', {
  'should return decoded packets': function () {
    var result = app.getDecodedPackets(filename)
    return result
      .then(() => {
        console.log(result)
        buster.assert.equals(5375, result.packets.length)
      })
  }
})
