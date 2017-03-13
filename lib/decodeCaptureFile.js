const pcap = require('pcap')

// TODO: check if file exists / filename valid in seperate function
function getDecodedPacketsFromFile (filename) {
  // wait until file is processed
  return new Promise((resolve, reject) => {
    try {
      var pcapSession = createPcapSessionFromFile(filename)
      var decodedPackets = []
      pcapSession.on('packet', (rawPacket) => handleRawPacket(decodedPackets, rawPacket))
      pcapSession.on('complete', () => {
        // console.log('Reading file done.')
        pcapSession.close()
        resolve(decodedPackets)
      })
    } catch (error) {
      reject(error)
    }
  })
}

function createPcapSessionFromFile (filename) {
  try {
    return pcap.createOfflineSession(filename, '')
  } catch (err) {
    throw handleError(err)
  }
}

function handleRawPacket (decodedPacketsArray, rawPacket) {
  try {
    var decodedPkt = pcap.decode.packet(rawPacket)
    decodedPacketsArray.push(decodedPkt)
  } catch (err) {
    console.log(err)
  }
}

function handleError (err) {
  var error
  if (err.message.includes('No such file')) {
    error = new Error('No such file')
  } else if (err.message.includes('truncated dump file')) {
    // console.log('truncated')
    error = new Error('File is empty or truncated')
  } else {
    console.log(err)
    error = err
  }
  return error
}

module.exports = {
  getDecodedPacketsFromFile
}
