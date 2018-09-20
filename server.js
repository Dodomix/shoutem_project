const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const _ = require('lodash');
const util = require('./server-util');

const pub = fs.readFileSync('public.pem');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Amz-Date, X-Amz-Security-Token');
  next();
});

const gameState = {
  board: util.boardToPositionArrays(),
  currentPlayer: 'white',
  move: {
    black: null,
    white: null
  },
  gameStatus: null,
  whitePlayerTitle: 'Player 1 (white)',
  blackPlayerTitle: 'Player 2 (black)'
};

app.get('/api/state', (req, res) => {
  const tokenData = jwt.verify(req.query.token, pub, {algorithm: 'RS512'});
  if (req.query.origin !== tokenData.origin) {
    res.status(403).send({
      message: 'Invalid origin'
    });
  } else {
    res.send(util.getReadableState(gameState, tokenData.permissions));
  }
});

app.post('/api/state', (req, res) => {
  const body = req.body;
  const tokenData = jwt.verify(body.token, pub, {algorithm: 'RS512'});
  if (body.origin !== tokenData.origin) {
    res.status(403).send({
      message: 'Invalid origin'
    });
  } else if (!util.hasPermission(tokenData.permissions, body.stateUpdate)) {
    res.status(403).send({
      message: 'Action not permitted'
    });
  } else {
    const updatedState = {};
    _.assign(updatedState, gameState, body.stateUpdate);
    if (util.executeActions(updatedState)) {
      _.assign(gameState, updatedState);
      res.send({
        message: 'State updated'
      });
    } else {
      res.status(403).send({
        message: 'Action not valid'
      });
    }
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));