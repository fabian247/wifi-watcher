const io = require('./decodeCaptureFile')
const server = require('./server')
const capture = require('./startCapture')

// const filename = '../iad-if-wlan_24.02.17_2029.eth'
// const filename = './http_with_jpegs.cap'
const filename = './dump.eth'
// source: https://wiki.wireshark.org/SampleCaptures?action=AttachFile&do=get&target=http_with_jpegs.cap.gz

// const filename = '../nb6-startup.pcap'
// source: https://wiki.wireshark.org/SampleCaptures?action=AttachFile&do=get&target=nb6-startup.pcap

const config = require('../../config.json')

capture.captureFromFitzbox(config)

var promisedPackets = io.getDecodedPacketsFromFile(filename)
promisedPackets
.then((res) => {
  console.log(res)
})

server.startServer(3000)
