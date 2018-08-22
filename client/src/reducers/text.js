import {
  TEXT_REQUEST,
  TEXT_RESPONSE,
  FETCH_TEXT_FAILED,
  POST_TEXT_FAILED
} from '../actions/actionConstants';

const initialState = {
  text: '',
  style: {}
};

const text = (state = initialState, action) => {
  switch (action.type) {
    case TEXT_REQUEST:
      return Object.assign({}, state, {
        fetchInProgress: true,
        fetchFailed: false,
        postFailed: false
      });
    case TEXT_RESPONSE:
      return Object.assign({}, state, {
        text: action.text,
        style: action.style,
        fetchInProgress: false
      });
    case FETCH_TEXT_FAILED:
      return Object.assign({}, state, {
        fetchFailed: true
      });
    case POST_TEXT_FAILED:
      return Object.assign({}, state, {
        postFailed: true
      });
    default:
      return state;
  }
};

export default text;