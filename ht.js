const express = require('express')
const { data, constant } = require('./data.js')
const {
    generateKey,
    createUser,
    initRoomData,
    deleteRoom,
} = require('./utils.js')

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const createRoom = (req, res) => {
    const roomKey = generateKey(data)
    data[roomKey] = {
        colorOrder: null,
        user: {},
        status: constant.ROOM_STATUS.waiting,
        data: null,
        timer: setTimeout(() => {
            deleteRoom(roomKey, data)
        }, 600000),
        ws: [],
    }

    data[roomKey].colorOrder = ['red', 'blue', 'green', 'yellow']
        .map((color) => ({ color: color, ram: Math.random() }))
        .sort((a, b) => a.ram - b.ram)
        .map((colorObj) => colorObj.color)

    initRoomData(data[roomKey])
    const userId = createUser(data[roomKey])

    res.send({ roomKey, userId, color: data[roomKey].user[userId].color })
}

/**
 *
 * @param {Request} req
 * @param {Request} res
 */
const joinRoom = (req, res) => {
    const roomKey = req.params.roomKey

    if (!data[roomKey]) return res.send('房间不存在')
    if (Object.keys(data[roomKey].user).length >= 4) return res.send('房间已满')
    if (data[roomKey].status !== constant.ROOM_STATUS.waiting)
        return res.send('游戏已经开始')

    const userId = createUser(data[roomKey])
    //reset timer
    clearTimeout(data[roomKey].timer)
    data[roomKey].timer = setTimeout(() => {
        deleteRoom(roomKey, data)
    }, 600000)

    return res.send({
        userId,
        color: data[roomKey].user[userId].color,
        user: Object.keys(data[roomKey].user).map(
            (id) => data[roomKey].user[id].color
        ),
    })
}

const getRoomStatus = (req, res) => {
    const room = data[req.params.roomKey]

    if (!room) return res.send('房间不存在')

    return res.send({
        roomStatus: room.status,
        user: Object.keys(room.user).map((id) => room.user[id].color),
    })
}

const startGame = (req, res) => {
    const room = data[req.params.roomKey]

    if (!room) return res.send('房间不存在')

    room.status = constant.ROOM_STATUS.pre_round
    clearTimeout(room.timer)
    // initRoomData()
    res.send('ok')
}

const getUserRoomData = (req, res) => {
    const room = data[req.params.roomKey]
    if (!room) return res.send('房间不存在')

    const user = room.user[req.query.userId]
    if (!user) return res.send('用户不存在')

    const result = {
        cityData: room.data.cityData,
        playedData: room.data.playedData,
        ...user,
        otherUsers: Object.keys(room.user)
            .filter((userId) => userId !== req.query.userId)
            .map((userId) => ({
                color: room.user[userId].color,
                score: room.user[userId].score,
                chessData: room.user[userId].chessData,
                leftChessData: room.user[userId].leftChessData,
            })),
    }

    res.send(result)
}

const postRoundChess = (req, res) => {
    const room = data[req.params.roomKey]
    const { userId, roundChess, leftChess } = req.body

    room.user[userId].chessData = [...roundChess]
    room.user[userId].leftChessData = { ...leftChess }

    res.send('ok')
}

const httpStart = (port) => {
    const app = express()

    app.use(express.static('public'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.get('/createRoom', createRoom)
    app.get('/:roomKey/join', joinRoom)
    app.get('/:roomKey/status', getRoomStatus)
    app.get('/:roomKey/start', startGame)
    app.get('/:roomKey', (req, res) => {
        res.setHeader('Content-Type', 'text/html')
        res.sendFile(`${__dirname}/public/index.html`)
    })
    app.get('/:roomKey/data', getUserRoomData)

    app.post('/:roomKey/postRoundChess', postRoundChess)

    return app.listen(port, () => {
        console.log('connected')
        //test
    })
}

module.exports = httpStart
