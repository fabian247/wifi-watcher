const buster = require('buster')
const app = require('../lib/fileIO')

const filename = './http_with_jpegs.cap'
// source: https://wiki.wireshark.org/SampleCaptures?action=AttachFile&do=get&target=http_with_jpegs.cap.gz

buster.testCase('get Decoded Packets', {
  // this testcase relies on a local dump of packages not in git
  // TODO: create a dummy-dumpfile for upload
  'should return decoded packets': function () {
    return app.getDecodedPacketsFromFile(filename)
    .then((res, err) => {
      buster.assert.equals(476, res.packets.length)
    })
  },
  'should reject promise if no file': function () {
    return app.getDecodedPacketsFromFile('')
    .then((res) => {}, (err) => {
      buster.assert.equals(err, new Error())
      buster.assert.match(err.message, 'No such file')
    })
  },
  'should reject promise if file is empty': function () {
    return app.getDecodedPacketsFromFile('emptyFile.txt')
    .then((res) => {}, (err) => {
      buster.assert.equals(err, new Error())
      buster.assert.match(err.message, 'File is empty')
    })
  }
})
