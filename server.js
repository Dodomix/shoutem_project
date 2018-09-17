const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const Chess = require('chess.js').Chess;
const _ = require('lodash');

const chess = new Chess();

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

const squareToPosition = (piece, square) => piece + '@' + square;

const boardToPositionArrays = () => {
  const pieces = {
    white: [],
    black: []
  };
  chess.SQUARES.forEach(square => {
    const piece = chess.get(square);
    if (piece !== null) {
      if (piece.color === 'b') {
        pieces.black.push(squareToPosition(piece.type, square));
      } else {
        pieces.white.push(squareToPosition(piece.type.toUpperCase(), square));
      }
    }
  });
  return pieces;
};

const gameState = {
  board: boardToPositionArrays(),
  currentPlayer: 'white',
  move: {
    black: null,
    white: null
  }
};

const toggleCurrentPlayer = state => state.currentPlayer = state.currentPlayer === 'white' ? 'black' : 'white';

const getReadableState = permissions => {
  const readableState = {};
  _.forEach(permissions.read, permission => _.set(readableState, permission, _.get(gameState, permission)));
  return readableState;
};

const hasPermission = (permissions, stateUpdate) => {
  const permittedStateUpdate = {};
  _.forEach(permissions.write, permission => _.set(permittedStateUpdate, permission, _.get(stateUpdate, permission)));
  return _.isEqual(stateUpdate, permittedStateUpdate);
};

const executeActions = state => {
  let valid = true;
  if (state.move) {
    valid = valid && chess.move(state.move[state.currentPlayer], {
      sloppy: true
    });
  }
  if (valid) {
    state.board = boardToPositionArrays();
    toggleCurrentPlayer(state);
  }
  return valid;
};

app.get('/api/state', (req, res) => {
  const tokenData = jwt.verify(req.query.token, pub, { algorithm: 'RS512'});
  if (req.query.origin !== tokenData.origin) {
    res.status(403).send({
      message: 'Invalid origin'
    });
  } else {
    res.send(getReadableState(tokenData.permissions));
  }
});

app.post('/api/state', (req, res) => {
  const body = req.body;
  const tokenData = jwt.verify(body.token, pub, { algorithm: 'RS512'});
  if (body.origin !== tokenData.origin) {
    res.status(403).send({
      message: 'Invalid origin'
    });
  } else if (!hasPermission(tokenData.permissions, body.stateUpdate)) {
    res.status(403).send({
      message: 'Action not permitted'
    });
  } else {
    const updatedState = {};
    _.assign(updatedState, gameState, body.stateUpdate);
    if (executeActions(updatedState)) {
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