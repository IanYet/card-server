const express = require('express')
const { data, constant } = require('./data.js')
const { generateKey, createUser, initRoomData } = require('./utils.js')

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
        user: null,
        status: constant.ROOM_STATUS.waiting,
        data: null,
    }

    data[roomKey].colorOrder = ['red', 'blue', 'green', 'yellow']
        .map((color) => ({ color: color, ram: Math.random }))
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
    const roomKey = req.query.room

    if (!data[roomKey]) return res.send('房间不存在')
    if (Object.keys(data[roomKey].user).length >= 4) return res.send('房间已满')
    if (data[roomKey].status !== constant.ROOM_STATUS.waiting)
        return res.send('游戏已经开始')

    const userId = createUser(data[roomKey])

    return res.send({
        userId,
        user: Object.keys(data[roomKey].user).map((user) => user.color),
    })
}

const getRoomStatus = (req, res) => {
    const room = data[req.params.roomKey]
    return res.send({
        roomStatus: room.status,
        user: Object.keys(room.user).map((user) => user.color),
    })
}

const startGame = (req, res) => {
    const room = data[req.params.roomKey]

    room.status = constant.ROOM_STATUS.gaming
    initRoomData()
    res.send('ok')
}

const getUserRoomData = (req, res) => {
    const room = data[req.params.roomKey]
    const user = room.user[req.query.userId]

    const result = {
        cityData: room.data.cityData,
        playedData: room.data.playedData,
        ...user,
        otherUsers: Object.keys(room.user).map((userId) => ({
            color: room.user[userId].color,
            score: room.user[userId].score,
            chessData: room.user[userId].chessData,
            leftChessData: room.user[userId].leftChessData,
        })),
    }

    res.send(result)
}

const httpStart = (port) => {
    const app = express()

    app.use(express.static('public'))

    app.get('/createRoom', createRoom)
    app.get('/joinRoom', joinRoom)
    app.get('/:roomKey/status', getRoomStatus)
    app.get('/:roomKey/start', startGame)
    app.get('/:roomKey', () => {
        res.setHeader('Content-Type', 'text/html')
        res.sendfile(`${__dirname}/public/index.html`)
    })
    app.get('/:roomKey', getUserRoomData)

    app.listen(port, () => {
        console.log('connected')
    })
}

module.exports = httpStart
