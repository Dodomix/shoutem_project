import {
  ASSIGN_IFRAME,
  SET_IFRAME_LOADED,
  API_REQUEST,
  API_REQUEST_SUCCESS,
  API_REQUEST_FAILED
} from './actionConstants';

export const assignIframe = (iframeName, ref) => ({
  type: ASSIGN_IFRAME,
  iframeName,
  ref
});

export const setIframeLoaded = (iframe, loaded) => ({
  type: SET_IFRAME_LOADED,
  iframe,
  loaded
});

export const apiRequest = () => ({
  type: API_REQUEST
});

export const apiRequestSuccess = () => ({
  type: API_REQUEST_SUCCESS
});

export const apiRequestFailed = err => ({
  type: API_REQUEST_FAILED,
  err
});

const callApi = async (path, options) => {
  const response = await fetch(`http://localhost:5000${path}`, options);
  const body = await response.json();

  if (response.status !== 200) throw Error(`${response.status} ${body.message}`);

  return body;
};

export const fetchState = (origin, token) => {
  return dispatch => {
    dispatch(apiRequest());
    return callApi(`/api/state?origin=${encodeURIComponent(origin)}&token=${encodeURIComponent(token)}`, {
      headers: {
        'Accept': 'application/json'
      },
    }).then(body => {
      dispatch(apiRequestSuccess());
      return body;
    }).catch(err => {
      console.log(err);
      dispatch(apiRequestFailed(err));
    });
  };
};

export const postState = data => {
  return dispatch => {
    dispatch(apiRequest());
    return callApi('/api/state', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(() => {
      dispatch(apiRequestSuccess());
    }).catch(err => {
      if (err.message.startsWith('403')) {
        alert(err.message.substr(4));
      }
      dispatch(apiRequestFailed(err));
      throw err; // rethrow error
    });
  };
};