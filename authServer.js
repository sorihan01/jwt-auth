require('dotenv').config();
const express = require('express');
const { sendStatus } = require('express/lib/response');
const app = express();

const jwt = require('jsonwebtoken');
app.use(express.json());
// in production this would be stored in a db
let refreshTokens = [];

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshToken.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({name: user.name})
    res.json({accessToken})
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  // Authenticate User is implicit

  const username = req.body.username;
  const user = {name: username};

  // takes in a paylod to serialize, and a secret
  const accessToken = generateAccessToken(user);
  // manually handle the expiration of refresh token
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)
  res.json({accessToken, refreshToken})
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15s'})
}


app.listen(5500);