const exposeWebsites = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'
// console.log(decodedPackets)
var result
var promisedPackets = exposeWebsites.getDecodedPacketsFromFile(filename)
promisedPackets
.then((res) => {
  console.log('In main, read %d packets from result', res.packets.length)
  result = res
})
.then((res) => {
  var promisedWebsites = exposeWebsites.getWebsites(result)
  console.log('In main, Websites: read %d sites', promisedWebsites.dhosts.length)
  console.log(promisedWebsites.dhosts)
  console.log(promisedWebsites.shosts)
})
