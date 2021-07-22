const express = require('express')
const data = require('./data.js')
const { generateKey } = require('./utils.js')

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const createRoom = (req, res) => {
    const roomKey = generateKey(data)
    data[roomKey] = {}

    res.send(roomKey)
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const addRoom = (req, res) => {
    const userId = generateKey(data)
}

const httpStart = (port) => {
    const app = express()

    app.use(express.static('public'))

    app.get('/createRoom', createRoom)
    app.get('/addRoom', addRoom)

    app.listen(port, () => {
        console.log('connected')
    })
}

module.exports = httpStart
