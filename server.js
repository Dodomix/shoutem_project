'use strict';
const webSocketServer = require('websocket').server;
const http = require('http');
const Chess = require('chess.js').Chess;

const webSocketsServerPort = 8000;

const chess = new Chess();

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

const toggleCurrentPlayer = state => state.currentPlayer = state.currentPlayer === 'white' ? 'black' : 'white';

const executeActions = state => {
  let valid = true;
  if (state.move) {
    const move = getMove(state.move);
    move.promotion = 'q';
    valid = valid && chess.move(state.move[state.currentPlayer], {
      sloppy: true
    });
  }
  if (valid) {
    state.board = boardToPositionArrays();
    if (chess.game_over()) {
      state.gameStatus = 'Game ended in ' + (chess.in_checkmate() ? (state.currentPlayer + ' win') : 'draw');
    } else {
      toggleCurrentPlayer(state);
    }
  }
  return valid;
};

const getMove = move => move.white ? move.white : move.black;

let state = {
  board: boardToPositionArrays(),
  currentPlayer: 'white',
  gameStatus: null
};

const server = http.createServer(() => {});
server.listen(webSocketsServerPort, () => {
  console.log((new Date()) + ' Server is listening on port ' + webSocketsServerPort);
});

/**
 * WebSocket server
 */
const wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server.
  httpServer: server
});

const connectedNodes = {
  whitePlayer: null,
  blackPlayer: null,
  spectators: []
};
wsServer.on('request', request => {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

  let isWhitePlayer = false;
  let isBlackPlayer = false;
  
  const connection = request.accept(null, request.origin);
  
  if (!connectedNodes.whitePlayer) {
    connection.sendUTF(JSON.stringify(Object.assign({}, state, {
      isWhitePlayer: true
    })));
    connectedNodes.whitePlayer = connection;
    isWhitePlayer = true;
  } else if (!connectedNodes.blackPlayer) {
    connection.sendUTF(JSON.stringify(Object.assign({}, state, {
      isBlackPlayer: true
    })));
    connectedNodes.blackPlayer = connection;
    isBlackPlayer = true;
  } else {
    connection.sendUTF(JSON.stringify(state));
    connectedNodes.spectators.push(connection);
  }

  console.log((new Date()) + ' Connection accepted.');

  // user sent some message
  connection.on('message', message => {
    if (isWhitePlayer || isBlackPlayer) {
      state.move = JSON.parse(message.utf8Data).move;
    }
    if (executeActions(state)) {
      if (connectedNodes.whitePlayer) {
        connectedNodes.whitePlayer.sendUTF(JSON.stringify(Object.assign({}, state, {
          isWhitePlayer: true
        })));
      }
      if (connectedNodes.blackPlayer) {
        connectedNodes.blackPlayer.sendUTF(JSON.stringify(Object.assign({}, state, {
          isBlackPlayer: true
        })));
      }
      connectedNodes.spectators.forEach(connection => connection.sendUTF(JSON.stringify(state)));
    } else {
      if (isWhitePlayer) {
        connectedNodes.whitePlayer.sendUTF(JSON.stringify({
          error: 'Invalid move'
        }));
      } else if (isBlackPlayer) {
        connectedNodes.blackPlayer.sendUTF(JSON.stringify({
          error: 'Invalid move'
        }));
      }
    }
  });

  // user disconnected
  connection.on('close', connection => {
    console.log((new Date()) + ' Peer ' + connection + ' disconnected.');
    if (isWhitePlayer) {
      connectedNodes.whitePlayer = null;
    } else if (isBlackPlayer) {
      connectedNodes.blackPlayer = null;
    } else {
      connectedNodes.spectators = connectedNodes.spectators.filter(c => c === connection);
    }
  });
});