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

    createUser(data[roomKey])

    res.send({ roomKey: data[roomKey].user })
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

    return res.send({ id: userId, user: data[roomKey].user })
}

const getRoomStatus = (req, res) => {
    const room = data[req.params.roomKey]
    return res.send(room)
}

const startGame = (req, res) => {
    const room = data[req.params.roomKey]
    const userId = req.query.userId

    room.status = constant.ROOM_STATUS.gaming
    initRoomData()

    
}

const httpStart = (port) => {
    const app = express()

    app.use(express.static('public'))

    app.get('/createRoom', createRoom)
    app.get('/joinRoom', joinRoom)
    app.get('/:roomKey/status', getRoomStatus)
    app.get('/:roomKey')

    app.listen(port, () => {
        console.log('connected')
    })
}

module.exports = httpStart
