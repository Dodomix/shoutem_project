import {
  SET_SOURCE_WINDOW,
  TOKEN_REQUEST,
  TOKEN_RESPONSE,
  FETCH_TOKEN_FAILED
} from '../actions/actionConstants';

const initialState = {};

const comm = (state = initialState, action) => {
  switch (action.type) {
    case SET_SOURCE_WINDOW:
      return Object.assign({}, state, {
        sourceWindow: action.sourceWindow
      });
    case TOKEN_REQUEST:
      return Object.assign({}, state, {
        fetchInProgress: true,
        fetchFailed: false,
        postFailed: false
      });
    case TOKEN_RESPONSE:
      return Object.assign({}, state, {
        fetchInProgress: false
      });
    case FETCH_TOKEN_FAILED:
      return Object.assign({}, state, {
        fetchFailed: true
      });
    default:
      return state;
  }
};

export default comm;