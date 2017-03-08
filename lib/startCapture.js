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
 * TODO: check if spawn is successfull
 */
function startCapture (args) {
  try {
    var child = spawn('bash', [cmd].concat(args))
    return child
  } catch (err) {
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
 * TODO: check config, check stream,
 */
function getCaptureFromFitzbox (config) {
  // console.log(config[0], config[1], config[2])
  try {
    var stream = startCapture(config)
    var parser = pcapParser.parse(stream.stdout)
    parser.on('packet', (rawPacket) => {
      var decodedPkt = pcap.decode.packet(rawPacket)
      var IPs = exposeWebsites.getWebsitesFromPackets({packets: [decodedPkt]})
      if (IPs.length > 0) {
        io.writeConnectionToFile(IPs[0].senderIP, IPs[0].receiverIP)
        console.log(IPs)
      }
    })
    parser.on('complete', () => {
      console.log('complete')
    })
  } catch (err) {
    throw err
  }
}

module.exports = {
  startCapture,
  getCaptureFromFitzbox
}
