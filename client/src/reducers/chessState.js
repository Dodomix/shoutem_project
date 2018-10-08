import {
  RESET,
  UPDATE_CHESS_STATE
} from '../actions/actionConstants';
import * as Chess from 'chess.js';

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

const getMove = move => {
  return move.white ? move.white : move.black;
};

const initialState = {
  board: boardToPositionArrays(),
  currentPlayer: 'white',
  move: {
    black: null,
    white: null
  },
  gameStatus: null,
  isWhitePlayer: true,
  isBlackPlayer: true
};

const chessState = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CHESS_STATE:
      const updatedState = Object.assign({}, state, action.stateUpdate);
      updatedState.actionValid = executeActions(updatedState);
      return updatedState;
    case RESET:
      chess.reset();
      return Object.assign({}, state, {
        board: boardToPositionArrays()
      });
    default:
      return state;
  }
};

export default chessState;