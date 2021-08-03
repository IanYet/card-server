const express = require('express')
const { data, constant } = require('./data.js')
const {
    generateKey,
    createUser,
    initRoomData,
    deleteRoom,
    dealCard,
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
        colorOrder: ['red', 'blue', 'green', 'yellow']
            .map((color) => ({ color: color, ram: Math.random() }))
            .sort((a, b) => a.ram - b.ram)
            .map((colorObj) => colorObj.color),
        playOrder: [],
        user: {},
        status: constant.ROOM_STATUS.waiting,
        data: null,
        timer: setTimeout(() => {
            deleteRoom(roomKey, data)
        }, 600000),
        ws: [],
    }

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
        userList: Object.keys(room.user).map((userId) => ({
            up: room.user[userId].up,
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
    room.user[userId].ready = true

    res.send('ok')

    if (Object.keys(room.user).every((id) => room.user[id].ready)) {
        room.status = constant.ROOM_STATUS[`${room.playOrder[0]}_turn`]
        Object.keys(room.user).forEach((id) => (room.user[id].ready = false))

        const payload = {
            step: room.status,
            users: Object.keys(room.user).map((id) => ({
                color: room.user[id].color,
                score: room.user[id].score,
                chessData: room.user[id].chessData,
                leftChessData: room.user[id].leftChessData,
            })),
        }

        room.ws.forEach((ws) =>
            ws.ws.send(
                JSON.stringify({
                    type: constant.WS_TYPE.step,
                    payload,
                })
            )
        )
    }
}

const play = (req, res) => {
    const room = data[req.params.roomKey]
    const { userId, floor, card, area, leftCard, roundChess, cityData } =
        req.body
    const user = room.user[userId]

    user.chessData = roundChess
    user.cardData = leftCard

    room.data.playedData.push({
        floor,
        card,
        area,
        color: room.user[userId].color
    })
    room.data.cityData = cityData

    const roundEnd = Object.keys(room.user).every(
        (id) => room.user[id].chessData.length === 0
    )

    room.playOrder.push(room.playOrder.shift())
    room.status = roundEnd
        ? constant.ROOM_STATUS.round_end
        : constant.ROOM_STATUS[`${room.playOrder[0]}_turn`]

    const payload = {
        step: room.status,
        play: { floor, card, area, up: user.up },
        playedData: room.data.playedData,
        cityData: room.data.cityData,
        users: Object.keys(room.user).map((id) => ({
            color: room.user[id].color,
            chessData: room.user[id].chessData,
            leftChessData: room.user[id].leftChessData,
        })),
    }

    room.ws.forEach((ws) => {
        ws.ws.send(
            JSON.stringify({
                type: constant.WS_TYPE.step,
                payload,
            })
        )
    })

    dealCard(room.data.cardPool, user)
    res.send(user.cardData)
}

const postScore = (req, res) => {
    const room = data[req.params.roomKey]
    const { userId, score } = req.body
    const user = room.user[userId]

    user.score = user.score + parseInt(score)
    user.ready = true

    res.send('ok')
    if (Object.keys(room.user).every((id) => room.user[id].ready)) {
        room.status = Object.keys(user.leftChessData).every(
            (leftChess) => user.leftChessData[leftChess] === 0
        )
            ? constant.ROOM_STATUS.end
            : constant.ROOM_STATUS.pre_round

        Object.keys(room.user).forEach((id) => (room.user[id].ready = false))

        const payload = {
            step: room.status,
            users: Object.keys(room.user).map((id) => ({
                color: room.user[id].color,
                score: room.user[id].score,
            })),
        }

        room.ws.forEach((ws) =>
            ws.ws.send(
                JSON.stringify({
                    type: constant.WS_TYPE.step,
                    payload,
                })
            )
        )
    }
}

const leaveRoom = (req, res) => {
    deleteRoom(req.params.roomKey, data)
    res.send('ok')
}

const httpStart = (port) => {
    const app = express()

    app.use((req, res, next) => {
        if (req.path !== '/' && !req.path.includes('.')) {
            res.set({
                'Access-Control-Allow-Credentials': true, //允许后端发送cookie
                'Access-Control-Allow-Origin': req.headers.origin || '*', //任意域名都可以访问,或者基于我请求头里面的域
                'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type', //设置请求头格式和类型
                'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS', //允许支持的请求方式
                'Content-Type': 'application/json; charset=utf-8', //默认与允许的文本格式json和编码格式
            })
        }
        req.method === 'OPTIONS' ? res.status(204).end() : next()
    })

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
    app.post('/:roomKey/play', play)
    app.post('/:roomKey/score', postScore)

    app.get('/:roomKey/delete', leaveRoom)

    return app.listen(port, () => {
        console.log('connected')
        //test
    })
}

module.exports = httpStart
