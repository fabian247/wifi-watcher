const exposeWebsites = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'
var decodedPackets = exposeWebsites.getDecodedPackets(filename)
// console.log(decodedPackets)
String(decodedPackets)
