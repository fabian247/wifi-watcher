import { spawn } from 'child_process'
import { fork } from 'child_process'

const pcapStreamDecoder = './lib/pcapStreamDecoder'
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
    var pcapStreamChild = fork(pcapStreamDecoder, [], forkOpts)

    pcapStreamChild
        .on('close', () => {
            console.log('startCapture: Child closed')
        })
        .on('message', (message) => {
            const parsedMessage = JSON.parse(message)
            console.log(parsedMessage)
        })

    return pcapStreamChild
}

const connectInAndOutStreams = (inputStream, outputStream) => {
    outputStream.pipe(inputStream)
}

module.exports = {
    captureFromFitzbox
}
