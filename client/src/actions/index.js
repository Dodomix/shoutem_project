import {SET_IFRAME_LOADED, STATE_REQUEST, STATE_RESPONSE, FETCH_STATE_FAILED, POST_STATE_FAILED} from './actionConstants';

export const setIframeLoaded = (iframe, loaded) => ({
  type: SET_IFRAME_LOADED,
  iframe,
  loaded
});

export const stateRequest = () => ({
  type: STATE_REQUEST
});

export const receivedState = state => ({
  type: STATE_RESPONSE,
  state
});

export const receivedFetchStateError = err => ({
  type: FETCH_STATE_FAILED,
  err
});

export const receivedPostStateError = err => ({
  type: POST_STATE_FAILED,
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
    dispatch(stateRequest());
    return callApi(`/api/state?origin=${origin}&token=${token}`).then(body => {
      dispatch(receivedState(body.state));
    }).catch(err => {
      console.log(err);
      dispatch(receivedFetchStateError(err));
    });
  };
};

export const postState = data => {
  return dispatch => {
    dispatch(stateRequest());
    return callApi('/api/state', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(body => {
      dispatch(receivedState(body.state));
    }).catch(err => {
      if (err.message.startsWith('403')) {
        alert('Change not allowed');
      }
      console.log(err);
      dispatch(receivedPostStateError(err));
    });
  };
};