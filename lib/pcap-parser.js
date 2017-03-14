// original file from https://github.com/kunklejr/node-pcap-parser
// modified to work with fritzbox eth file and return full pcapPacket
// for decoding with node_pcap
// TODO: remove unneeded functions, refactor, apply linter standards

/* LICENCE:
Copyright (c) 2012 Near Infinity Corporation

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var util = require('util')
var events = require('events')
var fs = require('fs')
const pcap = require('pcap')

var GLOBAL_HEADER_LENGTH = 24 // bytes
var PACKET_HEADER_LENGTH = 16 // bytes, maybe too short for eth file?

function onError (err) {
  this.emit('error', err)
}

function onEnd () {
  this.emit('end')
}

function onData (data) {
  if (this.errored) {
    return
  }

  updateBuffer.call(this, data)

  while (this.state.call(this)) {
    // console.log('Working!');
  }
  // console.log('Done! ', this.state);
}

function updateBuffer (data) {
  if (data === null || data === undefined) {
    return
  }

  if (this.buffer === null) {
    this.buffer = data
  } else {
    var extendedBuffer = new Buffer(this.buffer.length + data.length)
    this.buffer.copy(extendedBuffer)
    data.copy(extendedBuffer, this.buffer.length)
    this.buffer = extendedBuffer
  }
}

function parseGlobalHeader () {
  var buffer = this.buffer

  if (checkIfEnoughData(buffer, GLOBAL_HEADER_LENGTH) === false) {
    return false
  }
  // console.log('enough data')
  this.magicNumber = getMagicNumber(buffer)
  // console.log('Magic Number')
  this.endianness = this.determinePcapEndianess(buffer, this.magicNumber)
  // console.log('Endianess')
  if (this.endianness === false) {
    return false
  }

  var globalHeader = getGlobalHeaderFromBuffer(buffer, this.endianness)
  // console.log(header)
  this.linkType = determineLinkLayer(globalHeader.linkLayerType)
  if (this.linkType === false) {
    return false
  }
  if (checkIfPcapVersionIsSupported(globalHeader) === false) {
    return false
  }
  // console.log(header)
  this.emit('globalHeader', globalHeader)
  this.buffer = buffer.slice(GLOBAL_HEADER_LENGTH)
  this.state = parsePacketHeader
  return true
}

function checkIfEnoughData (buffer, length) {
  if (buffer.length < length) {
    return false
  }
  return true
}

function getMagicNumber (buffer) {
  return buffer.toString('hex', 0, 4)
}

function determinePcapEndianess (buffer, magicNumber) {
  // console.log(magicNumber)
  var endianness
  // determine pcap endianness
  // added "a1b2cd34" for fritzbox eth file
  if ((magicNumber === 'a1b2c3d4') || (magicNumber === 'a1b2cd34')) {
    endianness = 'BE'
  } else if (magicNumber === 'd4c3b2a1') {
    endianness = 'LE'
  } else {
    this.handleError('unknown magic number: %s', magicNumber)
    return false
  }
  return endianness
}

function handleError (message) {
  // console.log(this)
  this.errored = true
  this.stream.pause()
  this.emit('error', new Error(message))
  onEnd.call(this)
}

function getGlobalHeaderFromBuffer (buffer, endianness) {
  return {
    magicNumber: buffer['readUInt32' + endianness](0, true),
    majorVersion: buffer['readUInt16' + endianness](4, true),
    minorVersion: buffer['readUInt16' + endianness](6, true),
    gmtOffset: buffer['readInt32' + endianness](8, true),
    timestampAccuracy: buffer['readUInt32' + endianness](12, true),
    snapshotLength: buffer['readUInt32' + endianness](16, true),
    linkLayerType: buffer['readUInt32' + endianness](20, true)
  }
}

function determineLinkLayer (linkLayerType) {
  // set link_type TODO: move to seperate function
  var linkType
  switch (linkLayerType) {
    case 0:
      linkType = 'LINKTYPE_NULL'
      break
    case 1:
      linkType = 'LINKTYPE_ETHERNET'
      break
    case 12:
      linkType = 'LINKTYPE_RAW'
      break
    case 113:
      linkType = 'LINKTYPE_ETHERNET'
      break
    case 127:
      linkType = 'LINKTYPE_IEEE802_11_RADIO'
      break
    default:
      console.log('pcap-parser: don\'t know how to do link_type ' + linkLayerType)
      linkType = false
  }
  return linkType
}

function checkIfPcapVersionIsSupported (globalHeader) {
  if (globalHeader.majorVersion !== 2 && globalHeader.minorVersion !== 4) {
    this.handleError('unsupported version %d.%d. pcap-parser only parses libpcap file format 2.4', globalHeader.majorVersion, globalHeader.minorVersion)
    return false
  }
}
// var handleError = handleErrorFactory.bind(this)

function getRawPacketBody () {
  var buffer = this.buffer
  if (buffer.length >= this.currentPacketHeader.capturedLength) {
    this.data = buffer.slice(0, this.currentPacketHeader.capturedLength)

    this.buffer = buffer.slice(this.currentPacketHeader.capturedLength)
    this.state = buildAndSendFullPackage
    return true
  }
  return false
}

function buildAndSendFullPackage () {
  var fullPacket = new pcap.PacketWithHeader(this.data, this.rawCurrentHeader, this.linkType)
  this.emit('packet', fullPacket)
  this.state = parsePacketHeader
  return true
}

// TODO: find out about extra 8 byte
// -->Alexey Kuznetsov's modified "libpcap"format
// https://github.com/boundary/wireshark/blob/master/wiretap/libpcap.h
// starting at line 75
// node_pcap can decode this correctly if present as dumpfile
function parsePacketHeader () {
  var buffer = this.buffer
  // console.log('header: length: ', buffer.length)
  // if (buffer.length >= PACKET_HEADER_LENGTH + 8) {
  if (buffer.length >= PACKET_HEADER_LENGTH) {
    var header = {
      timestampSeconds: buffer['readUInt32' + this.endianness](0, true),
      timestampMicroseconds: buffer['readUInt32' + this.endianness](4, true),
      capturedLength: buffer['readUInt32' + this.endianness](8, true),
      originalLength: buffer['readUInt32' + this.endianness](12, true),
      item1: buffer['readUInt32' + this.endianness](16, true),
      item2: buffer['readUInt16' + this.endianness](20, true),
      item3: buffer['readUInt16' + this.endianness](22, true)
    }

    this.currentPacketHeader = header
    this.emit('packetHeader', header)
    // console.log('Header: ', this.currentPacketHeader)

    // Set raw packet header to LE
    buffer.writeUInt32LE(header.timestampSeconds, 0, true)
    buffer.writeUInt32LE(header.timestampMicroseconds, 4, true)
    buffer.writeUInt32LE(header.capturedLength, 8, true)
    buffer.writeUInt32LE(header.originalLength, 12, true)

    // this.rawCurrentHeader = buffer.slice(0, PACKET_HEADER_LENGTH + 8)
    this.rawCurrentHeader = buffer.slice(0, PACKET_HEADER_LENGTH)

    // this.buffer = buffer.slice(PACKET_HEADER_LENGTH + 8)
    this.buffer = buffer.slice(PACKET_HEADER_LENGTH)
    this.state = getRawPacketBody
    // this.state = parsePacketBody
    return true
  }

  return false
}

// TODO: check if input is stream
function Parser (input) {
  if (typeof (input) === 'string') {
    this.stream = fs.createReadStream(input)
  } else {
    // assume a ReadableStream
    this.stream = input
  }

  this.stream.pause()
  this.stream.on('data', onData.bind(this))
  this.stream.on('error', onError.bind(this))
  this.stream.on('end', onEnd.bind(this))

  this.buffer = null
  this.state = parseGlobalHeader
  this.endianness = null
  this.magicNumber = null
  this.linkType = null

  this.determinePcapEndianess = determinePcapEndianess.bind(this)
  this.handleError = handleError.bind(this)

  process.nextTick(this.stream.resume.bind(this.stream))
}
util.inherits(Parser, events.EventEmitter)

exports.parse = function (input) {
  return new Parser(input)
}
