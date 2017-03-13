const buster = require('buster')
const supertest = require('supertest')
const app = require('../lib/router')

buster.testCase('router test', {
  'should return monitoring page on all routes': function (done) {
    this.timeout = 1000
    var router = app.makeServer(1234)
    supertest(router)
    .get('/')
    .expect(200)
    .end(done((err, res) => {
      buster.refute(err)
      buster.assert.match(res.text, /You visited following IP addresses/)
      app.stopServer(router)
    }))
    router = app.makeServer(4321)
    supertest(router)
    .post('/anotherRoute')
    .expect(200)
    .end(done((err, res) => {
      buster.refute(err)
      buster.assert.match(res.text, /You visited following IP addresses/)
      app.stopServer(router)
    }))
  }
})

buster.testCase('cleanIP', {
  'Should return clean IP': function () {
    buster.assert.equals(app.removeIPv6Preface('::ffff:0.0.0.0'), '0.0.0.0')
  }
})
