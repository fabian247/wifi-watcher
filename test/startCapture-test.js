const buster = require('buster')
const app = require('../lib/startCapture')

var config = 'testConfig'

buster.testCase('start capture from Fritzbox', {
  setUp: function () {
    this.startStub = this.stub(app, 'startFritzboxCapture').returns({stdout: null})
    this.createStub = this.stub(app, 'createPcapStreamChild').returns({stdin: null})
    this.connectStub = this.stub(app, 'connectInAndOutStreams')
  },
  tearDown: function () {
    this.startStub.restore()
    this.createStub.restore()
    this.connectStub.restore()
  },
  'should create child from to download from fritzbox': function () {
    app.captureFromFitzbox(config)
    buster.assert.calledOnce(this.startStub)
  },
  'should create pcapStreamChild': function () {
    app.captureFromFitzbox(config)
    buster.assert.calledOnce(this.createStub)
  },
  'should connect both children': function () {
    app.captureFromFitzbox(config)
    buster.assert.calledOnce(this.connectStub)
  },
  'should throw error if starting to capture fails': function () {
    this.createStub.restore()
    this.createStub = this.stub(app, 'createPcapStreamChild')
    .returns({stdin: null}).throws(new Error())
    buster.assert.exception(function () {
      app.captureFromFitzbox(config)
    })
  },
  'should throw error if pcapStreamChild fails': function () {
    this.startStub.restore()
    this.startStub = this.stub(app, 'startFritzboxCapture')
    .returns({stdout: null}).throws(new Error())
    buster.assert.exception(function () {
      app.captureFromFitzbox(config)
    })
  },
  'should throw error if connecting streams fails': function () {
    this.connectStub.restore()
    this.connectStub = this.stub(app, 'connectInAndOutStreams')
      .throws(new Error())
    buster.assert.exception(function () {
      app.captureFromFitzbox(config)
    })
  }
})
