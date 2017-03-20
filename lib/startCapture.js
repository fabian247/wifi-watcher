var spawn = require('child_process').spawn
var fork = require('child_process').fork

const pcapStream = './lib/createPcapStreamSession'
const cmd = './bin/loginAndGetDataFromFritz.sh'

// TODO: check config
function captureFromFitzbox (config) {
  try {
    var captureChild = module.exports.startFritzboxCapture(config)
    var pcapStreamChild = module.exports.createPcapStreamChild()
    module.exports.connectInAndOutStreams(pcapStreamChild.stdin, captureChild.stdout)
  } catch (err) {
    console.log('Failed to capture from Fritzbox.', err)
    throw err
  }
}

function startFritzboxCapture (config) {
  var child = spawn('bash', [cmd].concat(config))
  child.stdout.pause()

  child.on('error', (err) => {
    console.log('Error on capture child.')
    throw err
  })
  return child
}

function createPcapStreamChild () {
  var forkOpts = {stdio: [ 'pipe', 'inherit', 'pipe', 'ipc' ]}
  var pcapStreamChild = fork(pcapStream, [], forkOpts)

  pcapStreamChild
  .on('close', () => {
    console.log('startCapture: Child closed')
  })
  .on('message', (message) => {
    var packet = JSON.parse(message)
    handlePacket(packet)
  })

  return pcapStreamChild
}

function connectInAndOutStreams (inputStream, outputStream) {
  outputStream.pipe(inputStream)
}

function handlePacket (packet) {
  console.log(packet)
}

module.exports = {
  captureFromFitzbox,
  startFritzboxCapture,
  createPcapStreamChild,
  connectInAndOutStreams,
  handlePacket
}
