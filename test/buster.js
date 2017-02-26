var config = module.exports

config['shared'] = {
  rootPath: '../',
  environment: 'node' // or 'browser'
}

config['Unit Tests'] = {
  extends: 'shared',
  tests: [
    'test/**/*-test.js'
  ]
}

config['All Tests'] = {
  extends: 'shared',
  tests: [
    'test/**/*-test.js'
  ]
}
