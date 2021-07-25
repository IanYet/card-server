const generateKey = (cxt) => {
    const key = Math.random().toString().substr(2, 4)
    if (!cxt[key]) return key
    else return generateKey(cxt)
}

const createUser = (room) => {
    const userId = generateKey(room)
    room.user[userId] = {
        userId,
        score: 0,
        color: room.colorOrder.pop(),
        up: room.colorOrder.length,
        cardData: [],
        chessData: [],
        leftChessData: {
            1: 11,
            2: 6,
            3: 4,
            4: 3,
        },
    }

    return userId
}

const initRoomData = (room) => {
    room.data = {
        cityData: {
            area0: [
                [[], [], []],
                [[], [], []],
                [[], [], []],
            ],
            area1: [
                [[], [], []],
                [[], [], []],
                [[], [], []],
            ],
            area2: [
                [[], [], []],
                [[], [], []],
                [[], [], []],
            ],
            area3: [
                [[], [], []],
                [[], [], []],
                [[], [], []],
            ],
            area4: [
                [[], [], []],
                [[], [], []],
                [[], [], []],
            ],
            area5: [
                [[], [], []],
                [[], [], []],
                [[], [], []],
            ],
        },
        cardPool: [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 1],
            [0, 1],
            [0, 1],
            [0, 1],
            [0, 1],
            [0, 2],
            [0, 2],
            [0, 2],
            [0, 2],
            [0, 2],
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 2],
            [1, 2],
            [1, 2],
            [1, 2],
            [1, 2],
            [2, 0],
            [2, 0],
            [2, 0],
            [2, 0],
            [2, 0],
            [2, 1],
            [2, 1],
            [2, 1],
            [2, 1],
            [2, 1],
            [2, 2],
            [2, 2],
            [2, 2],
            [2, 2],
            [2, 2],
        ]
            .map((card) => ({ ram: Math.random(), card: card }))
            .sort((a, b) => a.ram - b.ram)
            .map((cardObj) => cardObj.card),
        playedData: {},
    }
}

const deleteRoom = (roomKey, data) => {
    const wsList = data[roomKey].ws

    wsList.forEach((ws) => {
        if (ws) {
            ws.close()
        }
    })
    delete data[roomKey]
}

// const checkRoom = (room, res) => { }

module.exports = {
    generateKey,
    createUser,
    initRoomData,
    deleteRoom,
}
