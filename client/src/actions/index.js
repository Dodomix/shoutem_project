import {SELECT_IFRAME, SET_IFRAME_LOADED, TEXT_REQUEST, TEXT_RESPONSE, FETCH_TEXT_FAILED, POST_TEXT_FAILED} from './actionConstants';

export const selectIframe = selectedIframe => ({
  type: SELECT_IFRAME,
  selectedIframe
});

export const setIframeLoaded = iframeLoaded => ({
  type: SET_IFRAME_LOADED,
  iframeLoaded
});

export const textRequest = () => ({
  type: TEXT_REQUEST
});

export const receivedText = (text, style) => ({
  type: TEXT_RESPONSE,
  text,
  style
});

export const receivedFetchTextError = err => ({
  type: FETCH_TEXT_FAILED,
  err
});

export const receivedPostTextError = err => ({
  type: POST_TEXT_FAILED,
  err
});

const callApi = async (path, options) => {
  const response = await fetch(`http://localhost:5000${path}`, options);
  const body = await response.json();

  if (response.status !== 200) throw Error(`${response.status} ${body.message}`);

  return body;
};

export const fetchText = () => {
  return dispatch => {
    dispatch(textRequest());
    return callApi('/api/text').then(body => {
      dispatch(receivedText(body.text, body.style));
    }).catch(err => {
      console.log(err);
      dispatch(receivedFetchTextError(err));
    });
  };
};

export const postText = data => {
  return dispatch => {
    dispatch(textRequest());
    return callApi('/api/text', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(body => {
      dispatch(receivedText(body.text, body.style));
    }).catch(err => {
      if (err.message.startsWith('403')) {
        alert('Change not allowed');
      }
      console.log(err);
      dispatch(receivedPostTextError(err));
    });
  };
};

export const resetText = () => {
  return dispatch => {
    dispatch(textRequest());
    return callApi('/api/text/reset', {
      method: 'POST'
    }).then(body => {
      dispatch(receivedText(body.text, body.style));
    }).catch(err => {
      console.log(err);
      dispatch(receivedPostTextError(err));
    });
  };
};