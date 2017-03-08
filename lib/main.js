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

capture.getCaptureFromFitzbox(config)

server.startServer(3000)
