const buster = require('buster')
const app = require('../lib/server')

buster.testCase('server test', {
  setUp: function () {
    this.listen = this.spy(app, 'startServer')
  },
  'should listen on port 1234': function () {
    var server = app.startServer(2314)
    app.stopServer(server)
    buster.assert.calledWith(this.listen, 2314)
  }
})
