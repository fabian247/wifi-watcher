const buster = require('buster')
const app = require('../lib/database')
const fs = require('fs')

buster.testCase('get entries from db', {
  'should return IP Adresses from database': function () {
    var db = {
      '10.1.1.101': [
        '10.1.1.1',
        '209.225.11.237',
        '209.225.0.6'
      ],
      '10.1.1.1': [
        '10.1.1.101'
      ]
    }
    var result = ['10.1.1.1', '209.225.11.237', '209.225.0.6']
    buster.assert.equals(app.getEntriesFromDatabase(db, '10.1.1.101'), result)
    buster.assert.equals(app.getEntriesFromDatabase(db, '10.1.1.1'), ['10.1.1.101'])
  }
})

buster.testCase('writeToFile', {
  'should call writeFileSync': function () {
    var stubWriteFileSync = this.stub(fs, 'writeFileSync')
    var database = null
    app.writeToFile(database)
    buster.assert.calledOnce(stubWriteFileSync)
    stubWriteFileSync.restore()
  },
  'should report error on console but return without failure': function () {
    var stubWriteFileSync = this.stub(fs, 'writeFileSync').throws(new Error())
    var database = null
    buster.refute.exception(function () {
      app.writeToFile(database)
    })
    stubWriteFileSync.restore()
  }
})

buster.testCase('writeToDatabase', {
  setUp: function () {
    this.stubWriteToFile = this.stub(app, 'writeToFile')
  },
  tearDown: function () {
    this.stubWriteToFile.restore()
  },
  'should call writeToFile once with updated database if sender not in database': function () {
    var connection = {local: '1', receiver: '2'}
    var database = {}
    var result = {1: ['2']}
    app.writeToDatabase(database, connection)
    buster.assert.calledOnce(this.stubWriteToFile)
    buster.assert.equals(this.stubWriteToFile.args[0][0], result)
  },
  'should call writeToFile once with updated databse if only receiver not in database': function () {
    var connection = {local: '1', receiver: '2'}
    var database = {1: ['1']}
    var result = {1: ['1', '2']}
    app.writeToDatabase(database, connection)
    buster.assert.calledOnce(this.stubWriteToFile)
    buster.assert.equals(this.stubWriteToFile.args[0][0], result)
  },
  'should not call writeToFile if connection already in database': function () {
    var connection = {local: '1', receiver: '2'}
    var database = {1: ['2']}
    app.writeToDatabase(database, connection)
    buster.assert(this.stubWriteToFile.notCalled)
  }
})
