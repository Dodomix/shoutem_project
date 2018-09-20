const Chess = require('chess.js').Chess;
const _ = require('lodash');

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

const getReadableState = (state, permissions) => {
  const readableState = {};
  _.forEach(permissions.read, permission => _.set(readableState, permission, _.get(state, permission)));
  return readableState;
};

const hasPermission = (permissions, stateUpdate) => {
  const permittedStateUpdate = {};
  permissions.write
    .filter(permission => _.get(stateUpdate, permission))
    .forEach(permission => _.set(permittedStateUpdate, permission, _.get(stateUpdate, permission)));
  return _.isEqual(stateUpdate, permittedStateUpdate);
};

const executeActions = state => {
  let valid = true;
  if (state.move) {
    state.move[state.currentPlayer].promotion = 'q';
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

module.exports = {
  squareToPosition: squareToPosition,
  boardToPositionArrays: boardToPositionArrays,
  toggleCurrentPlayer: toggleCurrentPlayer,
  getReadableState: getReadableState,
  hasPermission: hasPermission,
  executeActions: executeActions
};