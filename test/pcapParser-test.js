const buster = require('buster')
const fs = require('fs')
const app = require('../lib/pcap-parser')

buster.testCase('pacp parser test little-endian', {
  setUp: function () {
    this.parser = app.parse(fs.createReadStream('./test/smtp.pcap'))
  },
  'should emit globalHeader event': function (done) {
    var globalHeaderSpy = this.spy()
    var globalHeader
    this.parser.on('globalHeader', (res) => {
      globalHeader = res
      globalHeaderSpy()
    })
    setTimeout(function () {
      buster.assert(globalHeaderSpy.called)
      buster.assert(globalHeader)
      buster.assert.equals(globalHeader.magicNumber, 2712847316)
      buster.assert.equals(globalHeader.majorVersion, 2)
      buster.assert.equals(globalHeader.minorVersion, 4)
      buster.assert.equals(globalHeader.gmtOffset, 0)
      buster.assert.equals(globalHeader.timestampAccuracy, 0)
      buster.assert.equals(globalHeader.snapshotLength, 65535)
      buster.assert.equals(globalHeader.linkLayerType, 1)
      done()
    }, 100)
  },
  'should emit packetHeader event': function (done) {
    var packetHeaderSpy = this.spy()
    var packetHeader
    this.parser.once('packetHeader', (res) => {
      packetHeader = res
      packetHeaderSpy()
    })
    setTimeout(function () {
      buster.assert(packetHeaderSpy.called)
      buster.assert(packetHeader)
      buster.assert.equals(packetHeader.timestampSeconds, 1254722767)
      buster.assert.equals(packetHeader.timestampMicroseconds, 492060)
      buster.assert.equals(packetHeader.capturedLength, 76)
      buster.assert.equals(packetHeader.originalLength, 76)
      done()
    }, 100)
  },
  'should emit packet event': function (done) {
    var packetSpy = this.spy()
    var packet
    this.parser.once('packet', (res) => {
      packet = res
      packetSpy()
    })
    setTimeout(function () {
      buster.assert(packetSpy.called)
      buster.assert(packet)
      buster.assert(packet.buf)
      buster.assert(packet.header)
      buster.assert(packet.link_type)
      buster.assert.equals(packet.buf.length, 76)
      buster.assert.equals(packet.header.length, 16 + 8)
      buster.assert.equals(packet.link_type, 'LINKTYPE_ETHERNET')
      done()
    }, 100)
  },
  'should emit end event': function (done) {
    this.timeout = 1000
    var endSpy = this.spy()
    var countSpy = this.spy()
    var count = 0
    this.parser
    .on('packet', (packet) => {
      count++
      countSpy()
    })
    .on('end', () => {
      endSpy()
    })
    setTimeout(function () {
      buster.assert(endSpy.called)
      buster.assert.equals(count, 60)
      done()
    }, 1000)
  }
})

buster.testCase('pacp parser test big-endian', {
  setUp: function () {
    this.parser = app.parse(fs.createReadStream('./test/be.pcap'))
  },
  'should emit globalHeader event': function (done) {
    var globalHeaderSpy = this.spy()
    var globalHeader
    this.parser.on('globalHeader', (res) => {
      globalHeader = res
      globalHeaderSpy()
    })
    setTimeout(function () {
      buster.assert(globalHeaderSpy.called)
      buster.assert(globalHeader)
      buster.assert.equals(globalHeader.magicNumber, 2712847316)
      buster.assert.equals(globalHeader.majorVersion, 2)
      buster.assert.equals(globalHeader.minorVersion, 4)
      buster.assert.equals(globalHeader.gmtOffset, 0)
      buster.assert.equals(globalHeader.timestampAccuracy, 0)
      buster.assert.equals(globalHeader.snapshotLength, 9216)
      buster.assert.equals(globalHeader.linkLayerType, 1)
      done()
    }, 100)
  },
  'should emit packetHeader event': function (done) {
    var packetHeaderSpy = this.spy()
    var packetHeader
    this.parser.once('packetHeader', (res) => {
      packetHeader = res
      packetHeaderSpy()
    })
    setTimeout(function () {
      buster.assert(packetHeaderSpy.called)
      buster.assert(packetHeader)
      buster.assert.equals(packetHeader.timestampSeconds, 3064)
      buster.assert.equals(packetHeader.timestampMicroseconds, 714590)
      buster.assert.equals(packetHeader.capturedLength, 42)
      buster.assert.equals(packetHeader.originalLength, 60)
      done()
    }, 100)
  },
  'should emit packet event': function (done) {
    var packetSpy = this.spy()
    var packet
    this.parser.once('packet', (res) => {
      packet = res
      packetSpy()
    })
    setTimeout(function () {
      buster.assert(packetSpy.called)
      buster.assert(packet)
      buster.assert(packet.buf)
      buster.assert(packet.header)
      buster.assert(packet.link_type)
      buster.assert.equals(packet.buf.length, 42)
      buster.assert.equals(packet.header.length, 16 + 8)
      buster.assert.equals(packet.link_type, 'LINKTYPE_ETHERNET')
      done()
    }, 100)
  },
  'should emit end event': function (done) {
    this.timeout = 1000
    var endSpy = this.spy()
    var countSpy = this.spy()
    var count = 0
    this.parser
    .on('packet', (packet) => {
      count++
      countSpy()
    })
    .on('end', () => {
      endSpy()
    })
    setTimeout(function () {
      buster.assert(endSpy.called)
      buster.assert.equals(count, 5)
      done()
    }, 1000)
  }
})

buster.testCase('pcap-parser test malformed file', {
  'should emit error given a malformed pcap file': function (done) {
    var spy = this.spy()
    var error
    app.parse(fs.createReadStream('./test/malformed.pcap')).on('error', (err) => {
      error = err
      spy(err)
    })
    setTimeout(function () {
      buster.assert(spy.called)
      buster.assert(spy.calledWith(new Error()))
      buster.assert.match(error.message, /unknown magic number/)
      done()
    }, 100)
  }
})
