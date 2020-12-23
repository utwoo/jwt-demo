require('dotenv').config()

const express = require("express")
const app = express()

const jwt = require('jsonwebtoken')

app.use(express.json())

let refreshTokens = []

app.post('/login', (req, res) => {
    // Authenticate User
    const username = req.body.username
    const user = {name: username}
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECTET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken})
    })
})

app.delete('/logout', (req,res) =>{
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20s'});
}

function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECTET)
    refreshTokens.push(refreshToken)
    return refreshToken
}

app.listen(4000)
