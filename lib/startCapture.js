var spawn = require('child_process').spawn

const cmd = './bin/loginAndGetDataFromFritz.sh'
/**
 * runs capture script and returns stream
 * @param args - array of Strings [
 *          ipAddress: String with IP address of fritzbox
 *          password: String with password of fritzbox
 *          interface: interface to capture from
 *          ]
 */
function startCapture (args) {
  try {
    console.log('Args:', args)
    var child = spawn('bash', [cmd].concat(args))
    console.log('Child born.')
    return child
  } catch (err) {
    console.log(err)
    throw err
  }
}

/**
 * get data from fritzbox
 * @param config - array of Strings [
 *          ipAddress: String with IP address of fritzbox
 *          password: String with password of fritzbox
 *          interface: interface to capture from
 *          ]
 */
function getCaptureFromFitzbox (config) {
  console.log(config[0], config[1], config[2])
  try {
    var stream = startCapture(config)
    // stream.stdout.setEncoding('utf-8')
    stream.stdout.on('data', (data) => {
      console.log('receiving data ' + data)
    })
    stream.stderr.on('data', function (data) {
      console.log('stderr: ' + data)
    })

    stream.on('exit', function (code) {
      console.log('exit code: ' + code)
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  startCapture,
  getCaptureFromFitzbox
}
