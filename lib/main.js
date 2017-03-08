const exposeWebsites = require('../lib/expose_websites')
const io = require('./fileIO')
const server = require('./server')
const capture = require('./startCapture')

// const filename = '../iad-if-wlan_24.02.17_2029.eth'
const filename = './http_with_jpegs.cap'
// source: https://wiki.wireshark.org/SampleCaptures?action=AttachFile&do=get&target=http_with_jpegs.cap.gz

// const filename = '../nb6-startup.pcap'
// source: https://wiki.wireshark.org/SampleCaptures?action=AttachFile&do=get&target=nb6-startup.pcap

const config = require('../../config.json')

// console.log(decodedPackets)
// var result
// var IPs
var stream = capture.getCaptureFromFitzbox(config)

// var promisedPackets = io.getDecodedPacketsFromFile(filename)
// promisedPackets
// .then((res) => {
//   console.log('In main, read %d packets from result', res.packets.length)
//   result = res
//   console.log(result.packets[0])
// }, (err) => {
//   console.log(err)
// })
// .then(() => {
//   IPs = exposeWebsites.getWebsitesFromPackets(result)
//   console.log('got IPs')
//   console.log('IPs:', IPs)
//   for (var ip of IPs) {
//     io.writeConnectionToFile(ip.senderIP, ip.receiverIP)
//   }
// }, (err) => {
//   console.log(err)
// })
// .then(() => {
//   var app = server.startServer(3000)
// })
