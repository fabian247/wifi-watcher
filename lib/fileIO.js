const pcap = require('pcap')
const fs = require('fs')
const exposeWebsites = require('./expose_websites')

const dbFilename = 'database.json'

/**
 * Return all packets from a capture file captured with fritzbox or wireshark
 * packets in file must be coded in pcap format
 * @param filename - String representing the filename on the computer
 * @return decodedPackets - object with array 'packets' of decoded pcap packets
 **/
function getDecodedPacketsFromFile (filename) {
  try {
    var pcapSession = pcap.createOfflineSession(filename, '')
  } catch (err) {
    var error
    if (err.message.includes('No such file')) {
      // console.log('No file')
      error = new Error('No such file')
    } else if (err.message.includes('truncated dump file')) {
      // console.log('truncated')
      error = new Error('File is empty or truncated')
    }
  }
  // wait until file is processed
  return new Promise((resolve, reject) => {
    if (error) {
      reject(error)
    } else {
      var decodedPackets = { packets: [] }
      pcapSession.on('packet', (rawPacket) => {
        decodedPackets.packets.push(pcap.decode.packet(rawPacket))
      })
      pcapSession.on('complete', () => {
        // console.log('Reading file done.')
        // console.log('Read %d packages', decodedPackets.packets.length)
        pcapSession.close()
        resolve(decodedPackets)
      })
    }
  })
}

/**
 * write contacted IP addresses or websites to file
 * check if data is already in file before writing
 * for now use hardcoded file
 * @param sender - sender IP address or website as String
 * @param receiver - receiver IP address or website as String
 **/
function writeConnectionToFile (sender, receiver) {
  var database = {}
  try {
    database = require('../' + dbFilename)
  } catch (err) {
    // if (err.code !== 'MODULE_NOT_FOUND') {
      // throw err
    console.log(err)
    // }
  }
  // console.log('Database is: ', database)
  var connection = exposeWebsites.getLocalAddress(sender, receiver)
  // add key to array, if not yet present
  if (!database.hasOwnProperty(connection.local)) {
    database[connection.local] = []
  }
  if (database[connection.local].indexOf(connection.receiver) === -1) {
    database[connection.local].push(connection.receiver)
  }
  fs.writeFileSync(dbFilename, JSON.stringify(database, null, 3), (err) => {
    if (err) {
      console.log(err)
      return
    }
  })
}

module.exports = {
  getDecodedPacketsFromFile,
  writeConnectionToFile
}
