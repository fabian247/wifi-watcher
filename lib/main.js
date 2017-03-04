const exposeWebsites = require('../lib/expose_websites')
const io = require('./fileIO')

const filename = '../iad-if-wlan_24.02.17_2029.eth'
// console.log(decodedPackets)
var result
var IPs
var promisedPackets = io.getDecodedPacketsFromFile(filename)
promisedPackets
.then((res) => {
  console.log('In main, read %d packets from result', res.packets.length)
  result = res
}, (err) => {
  console.log(err)
})
.then(() => {
  IPs = exposeWebsites.getWebsitesFromPackets(result)
  console.log('got IPs')
  console.log('IPs:', IPs)
  for (var ip of IPs) {
    io.writeConnectionToFile(ip.senderIP, ip.receiverIP)
  }
}, (err) => {
  console.log(err)
})
