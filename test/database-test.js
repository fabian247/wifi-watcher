const buster = require('buster')
const fs = require('fs')
const mockRequire = require('mock-require')
const app = require('../lib/database')

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

buster.testCase('loadDatabase', {
  'should return database if require finds file': function () {
    var filename = 'filePresent'
    var result = {1: ['1']}
    mockRequire(filename, result)
    buster.assert.equals(app.loadDatabase(filename), result)
  },
  'should return empty database if require cannot find file': function () {
    var filename = 'fileNotPresent'
    var result = {}
    mockRequire(filename, './throwModuleNotFoundExceptionWhenRequired')
    buster.assert.equals(app.loadDatabase(filename), result)
  },
  'should throw Error if require fails other than MODULE_NOT_FOUND': function () {
    var filename = 'fileFailsOtherThanNotFound'
    mockRequire(filename, './throwExceptionWhenRequired')
    buster.assert.exception(function () {
      app.loadDatabase(filename)
    })
  }
})
