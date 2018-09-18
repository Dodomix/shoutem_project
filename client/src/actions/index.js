import {
  ASSIGN_IFRAME,
  SET_COMMUNICATOR
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