const buster = require('buster')
const app = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'

buster.testCase('get Decoded Packets', {
  'should return decoded packets': function () {
    return app.getDecodedPackets(filename)
    .then((res, err) => {
      buster.assert.equals(5375, res.packets.length)
    })
  },
  'should reject promise if no file': function () {
    return app.getDecodedPackets('')
    .then((res) => {}, (err) => {
      buster.assert.equals(err, new Error())
      buster.assert.match(err.message, 'No such file')
    })
  },
  'should reject promise if file is empty': function () {
    return app.getDecodedPackets('emptyFile.txt')
    .then((res) => {}, (err) => {
      buster.assert.equals(err, new Error())
      buster.assert.match(err.message, 'File is empty')
    })
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
      // TODO: generate testfile in test setUp
      buster.assert.equals(5375, promisedWebsites.dhosts.length)
      buster.assert.equals(5375, promisedWebsites.shosts.length)
    })
  },
  'should throw exception if input is no object with array packets or with array not of type of pcap_packages': function () {
    var input = 12
    buster.assert.exception(() => {
      app.getWebsites(input)
    })
    input = { packets: 12 }
    buster.assert.exception(() => {
      app.getWebsites(input)
    })
  }
})
