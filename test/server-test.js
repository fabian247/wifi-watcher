const buster = require('buster')
const supertest = require('supertest')
const app = require('../lib/server')

buster.testCase('server test', {
  setUp: function () {
    this.listen = this.spy(app, 'startServer')
  },
  'should listen on port 1234': function () {
    app.startServer(1234)
    app.stopServer()
    buster.assert.calledWith(this.listen, 1234)
  },
  'should return monitoring page on all routes': function (done) {
    this.timeout = 1000
    supertest(app.startServer(1234))
    .get('/')
    .expect(200)
    .end(done((err, res) => {
      buster.refute(err)
      buster.assert.match(res.text, /You visited following IP addresses/)
      app.stopServer()
    }))
    supertest(app.startServer(1234))
    .post('/anotherRoute')
    .expect(200)
    .end(done((err, res) => {
      buster.refute(err)
      buster.assert.match(res.text, /You visited following IP addresses/)
      app.stopServer()
    }))
  }
})
