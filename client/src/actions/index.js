import {
  ASSIGN_IFRAME,
  SET_COMMUNICATOR,
  UPDATE_CHESS_STATE
} from './actionConstants';

export const assignIframe = (iframeName, ref) => ({
  type: ASSIGN_IFRAME,
  iframeName,
  ref
});

export const setCommunicator = communicator => ({
  type: SET_COMMUNICATOR,
  communicator
});

export const updateChessState = stateUpdate => ({
  type: UPDATE_CHESS_STATE,
  stateUpdate
});