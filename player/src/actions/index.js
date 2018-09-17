import {
  SET_SOURCE_WINDOW,
  HANDLE_MOVE_PIECE,
  HANDLE_DRAG_PIECE,
  TOKEN_REQUEST,
  TOKEN_RESPONSE,
  FETCH_TOKEN_FAILED,
  SET_BOARD_STATE
} from './actionConstants';

export const setSourceWindow = sourceWindow => ({
  type: SET_SOURCE_WINDOW,
  sourceWindow
});

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

export const tokenRequest = () => ({
  type: TOKEN_REQUEST
});

export const receivedToken = () => ({
  type: TOKEN_RESPONSE
});

export const receivedFetchTokenError = err => ({
  type: FETCH_TOKEN_FAILED,
  err
});

export const setBoardState = state => ({
  type: SET_BOARD_STATE,
  state
});

const callApi = async (path, options) => {
  const response = await fetch(`http://localhost:5001${path}`, options);
  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
};

export const fetchToken = () => {
  return dispatch => {
    dispatch(tokenRequest());
    return callApi('/api/token').then(body => {
      dispatch(receivedToken());
      return body.token;
    }).catch(err => {
      console.log(err);
      dispatch(receivedFetchTokenError(err));
    });
  };
};