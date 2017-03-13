const buster = require('buster')
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
