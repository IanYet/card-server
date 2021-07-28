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
            console.log(roomKey, wsData)

            if (!room) {
                ws.send(
                    JSON.stringify({
                        type: constant.WS_TYPE.error,
                        payload: {
                            msg: '房间不存在',
                        },
                    })
                )
                return ws.close()
            }

            if (type === constant.WS_TYPE.setColor) {
                const { userId } = wsData.payload

                room.ws.push({ userId, ws })
            } else if (type === constant.WS_TYPE.chat) {
                const { userId, message } = wsData.payload
                const color = room.user[userId].color

                room.ws.forEach((roomWs) => {
                    roomWs.ws.send(
                        JSON.stringify({ type, payload: { color, message } })
                    )
                })
            }
        })

        ws.on('close', () => {
            ws.close()
        })
    })
}

module.exports = websocketStart
