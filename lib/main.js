const exposeWebsites = require('../lib/expose_websites')

const filename = 'iad-if-wlan_24.02.17_2029.eth'
// console.log(decodedPackets)
var promisedPackets = exposeWebsites.getDecodedPackets(filename)
promisedPackets.then((result) => {
  console.log('In main, read %d packets from result', result.packets.length)
  promisedPackets = result
  var promisedWebsites = exposeWebsites.getWebsites(promisedPackets)
  promisedWebsites.then((res) => {
    console.log('In main, Websites: read %d packets', res.packets.length)
    promisedWebsites = res
  })
})
