import {
  HANDLE_DRAG_PIECE,
  HANDLE_MOVE_PIECE,
  SET_BOARD_STATE,
  SET_COMMUNICATOR,
  TOGGLE_ALLOW_MOVE_OTHER_PLAYER,
  TOGGLE_SENT_TOKEN
} from './actionConstants';

export const handleMovePiece = (piece, start, end) => ({
  type: HANDLE_MOVE_PIECE,
  piece,
  start,
  end
});

export const handleDragPiece = (piece, start, dragAllowed) => ({
  type: HANDLE_DRAG_PIECE,
  piece,
  start,
  dragAllowed
});

export const setBoardState = state => ({
  type: SET_BOARD_STATE,
  state
});

export const setCommunicator = communicator => ({
  type: SET_COMMUNICATOR,
  communicator
});

export const toggleSentToken = () => ({
  type: TOGGLE_SENT_TOKEN
});

export const toggleAllowMoveOtherPlayer = () => ({
  type: TOGGLE_ALLOW_MOVE_OTHER_PLAYER
});