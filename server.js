const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const chess = require('chess');
const _ = require('lodash');

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

const squareToPosition = (square, notation) => notation + '@' + square.file + square.rank;

const boardToPositionArrays = board => {
  return {
    white: board.squares
      .filter(square => square.piece && square.piece.side.name === 'white')
      .map(square => squareToPosition(square, square.piece.notation ? square.piece.notation : 'P')),
    black: board.squares
      .filter(square => square.piece && square.piece.side.name === 'black')
      .map(square => squareToPosition(square, square.piece.notation ? square.piece.notation.toLowerCase() : 'p')),
  };
};

const gameClient = chess.create();
const gameState = {
  board: boardToPositionArrays(gameClient.getStatus().board),
  currentPlayer: 'white',
  move: {
    black: null,
    white: null
  }
};

const toggleCurrentPlayer = () => gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';

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

const actionValid = state => {
  const move = state.move[state.currentPlayer];
  if (!move) {
    return false;
  }
  return _.some(gameClient.getStatus().notatedMoves, (value, key) => key === move);
};

const executeActions = () => {
  if (gameState.move) {
    gameClient.move(gameState.move[gameState.currentPlayer]);
  }
  gameState.board = boardToPositionArrays(gameClient.getStatus().board);
  toggleCurrentPlayer();
};

app.get('/api/board', (req, res) => {
  res.send(getReadableState(req.token));
});

app.post('/api/board', (req, res) => {
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
    if (actionValid(updatedState)) {
      _.assign(gameState, updatedState);
      executeActions();
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