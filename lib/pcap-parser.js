// original file from https://github.com/kunklejr/node-pcap-parser
// modified to work with fritzbox eth file and return full pcapPacket
// for decoding with node_pcap

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
var PACKET_HEADER_LENGTH = 16 // bytes
var ALEXEY_PACKET_HEADER_LENGTH = 24 // bytes

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
  this.rawPacketData = null
  this.endianness = null
  this.magicNumber = null
  this.linkType = null
  this.processingStep = parseGlobalHeader

  this.determinePcapEndianess = determinePcapEndianess.bind(this)
  this.handleError = handleError.bind(this)

  process.nextTick(this.stream.resume.bind(this.stream))
}
util.inherits(Parser, events.EventEmitter)

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

  this.buffer = updateBuffer(this.buffer, data)

  try {
    while (this.processingStep.call(this)) {
    }
  } catch (error) {
    this.handleError(error)
  }
}

function updateBuffer (buffer, data) {
  if (data === null || data === undefined) {
    return
  }

  if (buffer === null) {
    buffer = data
  } else {
    var extendedBuffer = new Buffer(buffer.length + data.length)
    buffer.copy(extendedBuffer)
    data.copy(extendedBuffer, buffer.length)
    buffer = extendedBuffer
  }
  return buffer
}

function handleError (error) {
  var message = error.message
  if (message.match(/not enough data in buffer/)) {
    return
  }

  this.errored = true
  this.stream.pause()
  this.emit('error', error)
  onEnd.call(this)
}

function parseGlobalHeader () {
  var buffer = this.buffer

  checkIfEnoughData(buffer, GLOBAL_HEADER_LENGTH)

  this.magicNumber = getMagicNumber(buffer)
  this.endianness = this.determinePcapEndianess(this.magicNumber)

  var globalHeader = getGlobalHeaderFromBuffer(buffer, this.endianness)
  this.linkType = determineLinkLayer(globalHeader.linkLayerType)

  checkIfPcapVersionIsSupported(globalHeader)

  this.emit('globalHeader', globalHeader)
  this.buffer = buffer.slice(GLOBAL_HEADER_LENGTH)
  this.processingStep = parsePacketHeader
  return true
}

function checkIfEnoughData (buffer, length) {
  if (buffer.length < length) {
    throw new Error('not enough data in buffer')
  }
}

function getMagicNumber (buffer) {
  return buffer.toString('hex', 0, 4)
}

function determinePcapEndianess (magicNumber) {
  var endianness
  // determine pcap endianness
  // added "a1b2cd34" and "34cdb2a1" for Alexey modified pcap format
  if ((magicNumber === 'a1b2c3d4') || (magicNumber === 'a1b2cd34')) {
    endianness = 'BE'
  } else if ((magicNumber === 'd4c3b2a1') || (magicNumber === '34cdb2a1')) {
    endianness = 'LE'
  } else {
    var message = util.format('unknown magic number: %s', magicNumber)
    throw new Error(message)
  }
  return endianness
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
      linkType = 'LINKTYPE_LINUX_SLL'
      break
    case 127:
      linkType = 'LINKTYPE_IEEE802_11_RADIO'
      break
    default:
      var message = util.format('link_type ' + linkLayerType + ' not supported')
      throw new Error(message)
  }
  return linkType
}

function checkIfPcapVersionIsSupported (globalHeader) {
  if (globalHeader.majorVersion !== 2 && globalHeader.minorVersion !== 4) {
    var message = util.format('unsupported version %d.%d. pcap-parser only parses libpcap file format 2.4', globalHeader.majorVersion, globalHeader.minorVersion)
    throw new Error(message)
  }
}

// TODO: find out about extra 8 byte
// -->Alexey Kuznetsov's modified "libpcap"format
// https://github.com/boundary/wireshark/blob/master/wiretap/libpcap.h
// starting at line 75
// node_pcap can decode this correctly if present as dumpfile
function parsePacketHeader () {
  var buffer = this.buffer
  var packetHeaderLength = determinePacketHeaderLengthFromMagicNumber(this.magicNumber)

  checkIfEnoughData(buffer, packetHeaderLength)

  var header = getHeaderFromBuffer(buffer, this.endianness, checkIfAlexeyModified(this.magicNumber))

  this.currentPacketHeader = header
  this.emit('packetHeader', header)

  // var rawHeader = buffer.slice(0, PACKET_HEADER_LENGTH + 8)
  var rawHeader = buffer.slice(0, packetHeaderLength)

  this.rawCurrentHeader = transformRawHeaderToLittleEndian(rawHeader, header)

  // this.buffer = buffer.slice(PACKET_HEADER_LENGTH + 8)
  this.buffer = buffer.slice(packetHeaderLength)
  this.processingStep = getRawPacketBody
  return true
}

function determinePacketHeaderLengthFromMagicNumber (magicNumber) {
  return checkIfAlexeyModified(magicNumber) ? ALEXEY_PACKET_HEADER_LENGTH : PACKET_HEADER_LENGTH
}

function checkIfAlexeyModified (magicNumber) {
  return (magicNumber === '34cdb2a1' || magicNumber === 'a1b2cd34')
}

function getHeaderFromBuffer (buffer, endianness, isAlexeyModified) {
  var header
  if (isAlexeyModified) {
    header = {
      timestampSeconds: buffer['readUInt32' + endianness](0, true),
      timestampMicroseconds: buffer['readUInt32' + endianness](4, true),
      capturedLength: buffer['readUInt32' + endianness](8, true),
      originalLength: buffer['readUInt32' + endianness](12, true),
      interfaceIndex: buffer['readUInt32' + endianness](16, true),
      protocol: buffer['readUInt16' + endianness](20, true),
      packetType: buffer['readUInt8'](22, true),
      pad: buffer['readUInt8'](23, true)
    }
  } else {
    header = {
      timestampSeconds: buffer['readUInt32' + endianness](0, true),
      timestampMicroseconds: buffer['readUInt32' + endianness](4, true),
      capturedLength: buffer['readUInt32' + endianness](8, true),
      originalLength: buffer['readUInt32' + endianness](12, true)
    }
  }
  return header
}

// node_pcap is used to decode packets and needs header as little-endians
function transformRawHeaderToLittleEndian (buffer, header) {
  buffer.writeUInt32LE(header.timestampSeconds, 0, true)
  buffer.writeUInt32LE(header.timestampMicroseconds, 4, true)
  buffer.writeUInt32LE(header.capturedLength, 8, true)
  buffer.writeUInt32LE(header.originalLength, 12, true)

  return buffer
}

function getRawPacketBody () {
  var buffer = this.buffer
  checkIfEnoughData(buffer, this.currentPacketHeader.capturedLength)

  this.rawPacketData = buffer.slice(0, this.currentPacketHeader.capturedLength)
  this.buffer = buffer.slice(this.currentPacketHeader.capturedLength)
  this.processingStep = buildAndSendFullPackage
  return true
}

function buildAndSendFullPackage () {
  var fullPacket = new pcap.PacketWithHeader(this.rawPacketData, this.rawCurrentHeader, this.linkType)
  this.emit('packet', fullPacket)
  this.processingStep = parsePacketHeader
  return true
}

exports.parse = function (input) {
  return new Parser(input)
}
