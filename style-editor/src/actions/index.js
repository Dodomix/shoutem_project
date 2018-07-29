import {
  SET_SOURCE_WINDOW,
  SET_TEXT,
  SET_STYLE,
  SET_FONT_FAMILY,
  SET_FONT_STYLE,
  SET_FONT_SIZE,
  SET_COLOR,
  TOKEN_REQUEST,
  TOKEN_RESPONSE,
  FETCH_TOKEN_FAILED} from './actionConstants';

export const setSourceWindow = sourceWindow => ({
  type: SET_SOURCE_WINDOW,
  sourceWindow
});

export const setText = text => ({
  type: SET_TEXT,
  text
});

export const setStyle = style => ({
  type: SET_STYLE,
  style
});

export const setFontFamily = fontFamily => ({
  type: SET_FONT_FAMILY,
  fontFamily
});

export const setFontStyle = fontStyle => ({
  type: SET_FONT_STYLE,
  fontStyle
});

export const setFontSize = fontSize => ({
  type: SET_FONT_SIZE,
  fontSize
});

export const setColor = color => ({
  type: SET_COLOR,
  color
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