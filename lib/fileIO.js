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
    } else {
      console.log(err)
      error = err
    }
  }
  // wait until file is processed
  return new Promise((resolve, reject) => {
    if (error) {
      reject(error)
    } else {
      var decodedPackets = { packets: [] }
      pcapSession.on('packet', (rawPacket) => {
        var decodedPkt
        try {
          decodedPkt = pcap.decode.packet(rawPacket)
          decodedPackets.packets.push(decodedPkt)
        } catch (err) {
          console.log(err)
        }
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
  if ((!sender) || (!receiver)) {
    return
  }
  var database = {}
  database = loadDatabase('../' + dbFilename)
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

/**
 * Returns content of file 'filename' as Object
 * @param filename - path to file to load as Sting
 * @return database - Object with content of file
 */
function loadDatabase (filename) {
  var database = {}
  try {
    database = require(filename)
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err
    }
  }
  return database
}

/**
 * Returns entries of key 'myIP' from database
 * @param database - Object which is used as database
 * @param myIP - key to get entries for, we assume it is an IP Adresse
 * @return ipList - Array of entries (IP addresses) found for key 'myIP'
 */
function getEntriesFromDB (database, myIP) {
  var ipList = []
  if (database.hasOwnProperty(myIP)) {
    for (var ip of database[myIP]) {
      ipList.push(ip)
    }
  }
  return ipList
}

module.exports = {
  getDecodedPacketsFromFile,
  writeConnectionToFile,
  loadDatabase,
  getEntriesFromDB
}
