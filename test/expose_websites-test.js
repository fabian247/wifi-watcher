const buster = require('buster')
const sinon = require('sinon')
const app = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'

buster.testCase('get Decoded Packets', {
  'should return decoded packets': function () {
    return app.getDecodedPacketsFromFile(filename)
    .then((res, err) => {
      buster.assert.equals(5375, res.packets.length)
    })
  },
  'should reject promise if no file': function () {
    return app.getDecodedPacketsFromFile('')
    .then((res) => {}, (err) => {
      buster.assert.equals(err, new Error())
      buster.assert.match(err.message, 'No such file')
    })
  },
  'should reject promise if file is empty': function () {
    return app.getDecodedPacketsFromFile('emptyFile.txt')
    .then((res) => {}, (err) => {
      buster.assert.equals(err, new Error())
      buster.assert.match(err.message, 'File is empty')
    })
  }
})

buster.testCase('get Websites', {
  setUp: function () {
    this.decPackets = app.getDecodedPacketsFromFile(filename)
  },
  'should return Websites': function () {
    var result
    return this.decPackets
    .then((res) => {
      result = res
      // console.log(res)
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

buster.testCase('process Packet', {
  setUp: function () {
    this.ipv4Packet = {
      payload:
      {
        ethertype: 2048,
        payload: {}
      }
    }
    this.ipv6Packet = {
      payload:
      {
        ethertype: 34525,
        payload: {}
      }
    }
  },
  'should call correct packet handler': function () {
    var stub = this.stub(app, 'handleIPv4Packet')
    app.processPacket(this.ipv4Packet)
    console.log('before assertion')
    buster.assert.called(stub)
  },
  'should call correct packet handler ipv6': function () {
    var stub = sinon.stub(app, 'handleIPv6Packet')
    app.processPacket(this.ipv6Packet)
    buster.assert.called(stub)
  }
})

// buster.testCase('handle IPv4 Packet', {
//   setUp: function () {
//     this.packet = {
//       saddr: { addr: [ 192, 168, 178, 33 ] },
//       daddr: { addr: [ 85, 124, 84, 253 ] }
//     }
//   },
//   'should return sender IP and receiver IP': function () {
//     buster.assert.equals(app.handleIPv4Packet(this.packet), {senderIP: '192.168.178.33', receiverIP: '85.124.84.253'})
//   }
// })
