const fs = require('fs')
const exposeWebsites = require('./expose_websites')

const dbFilename = 'database.json'

// TODO: check if IPs are valid
function writeConnectionToDatabase (route) {
  if ((!route.senderIP) || (!route.receiverIP)) {
    return
  }
  var sender = route.senderIP
  var receiver = route.receiverIP

  var database = loadDatabase('../' + dbFilename)
  var connection = exposeWebsites.getLocalAddress(sender, receiver)
  writeToDatabase(database, connection)
}

function loadDatabase (filename) {
  var database = {}
  try {
    database = require(filename)
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err
    }
  }
  return database
}

function writeToDatabase (database, connection) {
  if (!database.hasOwnProperty(connection.local)) {
    database[connection.local] = []
  }
  if (database[connection.local].indexOf(connection.receiver) === -1) {
    database[connection.local].push(connection.receiver)
    module.exports.writeToFile(database)
  }
}

function writeToFile (database) {
  try {
    fs.writeFileSync(dbFilename, JSON.stringify(database, null, 3))
  } catch (err) {
    console.log(err)
    return
  }
}

// TODO: check if database & IP valid, clean IP
function getEntriesFromDatabase (database, myIP) {
  var ipArray = []
  if (database.hasOwnProperty(myIP)) {
    for (var ip of database[myIP]) {
      ipArray.push(ip)
    }
  }
  return ipArray
}

module.exports = {
  writeConnectionToDatabase,
  loadDatabase,
  writeToDatabase,
  writeToFile,
  getEntriesFromDatabase
}
