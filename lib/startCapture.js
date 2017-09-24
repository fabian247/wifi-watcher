import { spawn } from 'child_process'
import { fork } from 'child_process'

const pcapStream = './lib/pcapStreamDecoder'
const cmd = './bin/loginAndGetDataFromFritz.sh'

// TODO: check config
const captureFromFitzbox = (config) => {
  try {
    var captureChild = startFritzboxCapture(config)
    var pcapStreamChild = createPcapStreamChild()
    connectInAndOutStreams(pcapStreamChild.stdin, captureChild.stdout)
  } catch (err) {
    console.log('Failed to capture from Fritzbox.', err)
    throw err
  }
}

const startFritzboxCapture = (config) => {
  console.log([cmd].concat(config))
  var child = spawn('bash', [cmd].concat(config))
  child.stdout.pause()

  child.on('error', (err) => {
    console.log('Error on capture child.')
    throw err
  })
  return child
}

const createPcapStreamChild = () => {
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

const connectInAndOutStreams = (inputStream, outputStream) => {
  outputStream.pipe(inputStream)
}

const handlePacket = (packet) => {
  console.log(packet)
}

module.exports = {
  captureFromFitzbox
}
