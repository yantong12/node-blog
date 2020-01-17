const http = require('http')

const PORT = 8000
const serverHandel = require('../app')

const server = http.createServer(serverHandel)

server.listen(PORT)