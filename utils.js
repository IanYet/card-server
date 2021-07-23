const generateKey = (cxt) => {
    const key = Math.random().toString().substr(2, 4)
    if (!cxt[key]) return key
    else return generateKey(cxt)
}

const createUser = (room) => {
    const userId = generateKey(room)
    room.user[userId] = { userId, color: room.colorOrder.pop() }

    return userId
}

const initRoomData = (room) => {
    room.data = {
        up: 0,
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
        cardData: [],
        chessData: [],
        leftChessData: {
            1: 11,
            2: 6,
            3: 4,
            4: 3,
        },
        playedData: {},
    }
}

module.exports = {
    generateKey,
    createUser,
    initRoomData,
}
