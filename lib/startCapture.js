const pcap = require('pcap')
const pcapParser = require('./pcap-parser')
const exposeWebsites = require('./expose_websites')
const io = require('./fileIO')

var spawn = require('child_process').spawn

const cmd = './bin/loginAndGetDataFromFritz.sh'
/**
 * runs capture script and returns stream
 * @param args - array of Strings [
 *          ipAddress: String with IP address of fritzbox
 *          password: String with password of fritzbox
 *          interface: interface to capture from
 *          ]
 */
function startCapture (args) {
  try {
    var child = spawn('bash', [cmd].concat(args))
    return child
  } catch (err) {
    console.log(err)
    throw err
  }
}

/**
 * get data from fritzbox
 * @param config - array of Strings [
 *          ipAddress: String with IP address of fritzbox
 *          password: String with password of fritzbox
 *          interface: interface to capture from
 *          ]
 */
function getCaptureFromFitzbox (config) {
  console.log(config[0], config[1], config[2])
  // var buffer
  try {
    var stream = startCapture(config)
    var parser = pcapParser.parse(stream.stdout) // 1
    parser.on('packet', (rawPacket) => {
      // console.log('Packet')
      // console.log(rawPacket)
      var decodedPkt
      decodedPkt = pcap.decode.packet(rawPacket)
      // console.log('Decoded Packet: ')
      // console.log(decodedPkt)
      var IPs = exposeWebsites.getWebsitesFromPackets({packets: [decodedPkt]})
      // console.log(IPs)
      if (IPs.length > 0) {
        io.writeConnectionToFile(IPs[0].senderIP, IPs[0].receiverIP)
      }
      // console.log('Done.')
      // console.log('')
    })
    parser.on('complete', () => {
      console.log('complete')
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  startCapture,
  getCaptureFromFitzbox
}
