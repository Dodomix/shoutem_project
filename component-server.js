const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cert = fs.readFileSync('private.pem');

const app = express();
const port = process.env.PORT || 5001;
const allowedOrigins = ['http://localhost:3001', 'http://localhost:3002'];

app.use((req, res, next) => {
  const origin = req.get('origin');
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Amz-Date, X-Amz-Security-Token');
  next();
});

const appData = {
  'http://localhost:3001': {
    origin: 'http://localhost:3001',
    permissions: {
      read: ['board', 'currentPlayer', 'gameStatus', 'whitePlayerTitle'],
      write: ['move.white']
    }
  },
  'http://localhost:3002': {
    origin: 'http://localhost:3002',
    permissions: {
      read: ['board', 'currentPlayer', 'gameStatus', 'blackPlayerTitle'],
      write: ['move.black']
    }
  }
};

app.get('/api/token', (req, res) => {
  const signed = jwt.sign(appData[req.get('origin')], cert, {algorithm: 'RS512'});
  res.send({
    token: signed
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));