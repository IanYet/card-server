const WebSocket = require('ws')
const { constant, data } = require('./data')

const websocketStart = (server) => {
    const wss = new WebSocket.Server({ server })

    wss.on('connection', (ws) => {
        // console.log(server.url)
        // ws.close()
        ws.on('message', (d) => {
            const wsData = JSON.parse(d)
            const { type, roomKey } = wsData
            const room = data[roomKey]

            if (type === constant.WS_TYPE.setColor) {
                const { userId } = wsData.payload
                const color = room.user[userId].color

                room.ws.push({ color, ws })
            } else if (type === constant.WS_TYPE.chat) {
                const { userId, message } = wsData.payload
                const color = room.user[userId].color

                room.ws.forEach((roomWs) => {
                    roomWs.ws.send(JSON.stringify({ color, message }))
                })
            }
        })

        ws.on('close', () => {
            ws.close()
        })
    })
}

module.exports = websocketStart
