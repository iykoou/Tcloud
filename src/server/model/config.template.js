const template = {
  'log': {
    'path': 'logs/'
  },
  'server': {
    'port': 8080,
    'masterKey': 'mymasterkey',
    'https': true,
    'hostname': '',
    'certs': {
      'privatekey': '',
      'certificate': '',
      'chain': ''
    }
  },
  'database': {
    'path': 'database/'
  },
  'authentification': false,
  'registration': true,
  'files': {
    'path': 'files/',
    'tmp': '.tmp/'
  },
  'torrent': {
    'providers': [],
    'jackett': {
      'endpoint': '',
      'apiKey': ''
    }
  },
  "adminUser": "admin"
}

module.exports = template

if (__filename.match(/.*template.*/g)) {
  console.log(JSON.stringify(template, 'undefined', 2))
}
