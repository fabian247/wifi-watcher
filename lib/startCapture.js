var spawn = require('child_process').spawn
var fork = require('child_process').fork

const pcapStream = './lib/createPcapStreamSession'
const cmd = './bin/loginAndGetDataFromFritz.sh'

// TODO: check config, check stream,
// TODO: return emitter, remove event handling
function captureFromFitzbox (config) {
  try {
    var captureChild = startFritzboxCapture(config)

    captureChild.stdout.pause()
    var forkOpts = {stdio: [ 'pipe', 'inherit', 'pipe', 'ipc' ]}
    var pcapStreamChild = fork(pcapStream, [], forkOpts)
    captureChild.stdout.pipe(pcapStreamChild.stdin)

    pcapStreamChild
    .on('close', () => {
      console.log('startCapture: Child closed')
    })
    .on('message', (message) => {
      var packet = JSON.parse(message)
      handlePacket(packet)
    })

    pcapStreamChild.stderr.on('data', (err) => {
      var error = new Error(err)
      console.log('Error on ipc stream: ', error)
    })
  } catch (err) {
    console.log('Failed to capture from Fritzbox.', err)
  }
}

function startFritzboxCapture (config) {
  var child = spawn('bash', [cmd].concat(config))
  child.on('error', (err) => {
    console.log('Failed to start capturing.')
    throw err
  })
  return child
}

function handlePacket (packet) {
  console.log(packet)
}

module.exports = {
  captureFromFitzbox,
  startFritzboxCapture,
  handlePacket
}
