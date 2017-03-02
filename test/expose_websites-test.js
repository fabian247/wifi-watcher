const buster = require('buster')
const sinon = require('sinon')
const app = require('../lib/expose_websites')
const IPv4 = require('pcap/decode/ipv4_addr')

const filename = 'iad-if-wlan_24.02.17_2029.eth'

// this.log = sinon.stub(console, 'log')

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
    buster.assert.called(stub)
  },
  'should call correct packet handler ipv6': function () {
    var stub = sinon.stub(app, 'handleIPv6Packet')
    app.processPacket(this.ipv6Packet)
    buster.assert.called(stub)
  }
})

buster.testCase('handle IPv4 Packet', {
  setUp: function () {
    this.saddr = new IPv4()
    this.saddr.addr = [192, 168, 178, 33]
    this.daddr = new IPv4()
    this.daddr.addr = [85, 124, 84, 253]
  },
  'should return sender IP and receiver IP as Strings': function () {
    var saddr = this.saddr
    var daddr = this.daddr
    var packet = { saddr, daddr }
    buster.assert.equals(app.handleIPv4Packet(packet), {senderIP: '192.168.178.33', receiverIP: '85.124.84.253'})
  }
})

buster.testCase('lookup Websites', {
  setUp: function () {
    this.timeout = 1000
    this.websiteIP = '216.58.205.195' // www.google.de
  },
  'should return name of website': function () {
    return app.lookupWebsites(this.websiteIP)
    .then((res) => {
      buster.assert.match(res, '1e100')
    })
  }
})
