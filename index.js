const httpStart = require('./ht')
const websocketStart = require('./ws')

const server = httpStart(9000)
websocketStart(server)

