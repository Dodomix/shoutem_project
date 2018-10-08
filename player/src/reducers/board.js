import Chess from 'react-chess';
import {
  HANDLE_DRAG_PIECE,
  HANDLE_MOVE_PIECE,
  SET_BOARD_STATE,
  TOGGLE_SENT_TOKEN,
  TOGGLE_ALLOW_MOVE_OTHER_PLAYER
} from '../actions/actionConstants';

const initialState = {
  currentPlayer: 'white',
  pieces: Chess.getDefaultLineup(),
  piece: null,
  gameStatus: null,
  sendOtherToken: false,
  allowMoveOtherPlayer: false
};

const formatMove = action => {
  return {
    from: action.start,
    to: action.end
  }
};

const computeMovedPiece = (state, action) =>
  action.dragAllowed && // if drag is not allowed, keep old piece
  (state.piece === null || // no old piece, use new one
    state.dragging) ?  // if already dragging, old piece was returned to its position, use new one
    action.piece : state.piece;

const board = (state = initialState, action) => {
  switch (action.type) {
    case HANDLE_MOVE_PIECE:
      return Object.assign({}, state, {
        piece: action.piece.position === action.start ? action.piece : null,
        move: formatMove(action),
        dragging: false
      });
    case HANDLE_DRAG_PIECE:
      return Object.assign({}, state, {
        piece: computeMovedPiece(state, action),
        dragging: action.dragAllowed
      });
    case SET_BOARD_STATE:
      return Object.assign({}, state, {
        pieces: [].concat(action.state.board.white, action.state.board.black),
        currentPlayer: action.state.currentPlayer,
        gameStatus: action.state.gameStatus,
        isWhitePlayer: action.state.isWhitePlayer,
        isBlackPlayer: action.state.isBlackPlayer,
        piece: null
      });
    case TOGGLE_SENT_TOKEN:
      return Object.assign({}, state, {
        sendOtherToken: !state.sendOtherToken
      });
    case TOGGLE_ALLOW_MOVE_OTHER_PLAYER:
      return Object.assign({}, state, {
        allowMoveOtherPlayer: !state.allowMoveOtherPlayer
      });
    default:
      return state;
  }
};

export default board;