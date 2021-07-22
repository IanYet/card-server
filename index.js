const express = require('express')
const app = express()
const port = 9000

app.get('/:key', (req, res, next) => {
    console.log(req.params)
    res.redirect('/')
    next()
})

app.use(express.static('public'))

app.listen(port, () => {
    console.log('connected')
})
