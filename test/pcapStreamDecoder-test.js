const buster = require('buster')
const pcap = require('pcap')
const app = require('../lib/pcapStreamDecoder')

buster.testCase('createPcapSessionFromStdin', {
  'should return pcapSession': function () {
    this.stub(pcap, 'createOfflineSession')
    app.createPcapSessionFromStdin()
    buster.assert.calledOnce(pcap.createOfflineSession)
  },
  'should throw error if creation of pcapSession fails': function () {
    this.stub(pcap, 'createOfflineSession').throws(new Error())
    buster.assert.exception(function () {
      app.createPcapSessionFromStdin()
    })
  }
})
