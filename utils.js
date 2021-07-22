const generateKey = (cxt) => {
    const key = Math.random().toString().substr(2, 4)
    if (!cxt[key]) return key
    else return generateKey(cxt)
}

module.exports = {
    generateKey,
}
