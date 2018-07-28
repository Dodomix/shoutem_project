import {
  SELECT_IFRAME,
  SET_IFRAME_LOADED
} from '../actions';

const initialState = {
  selectedIframe: 'content-editor',
  iframeData: {
    'content-editor': {
      origin: 'http://localhost:3001'
    },
    'style-editor': {
      origin: 'http://localhost:3002'
    },
    'malicious-page': {
      origin: 'http://localhost:3003'
    }
  },
  iframeLoaded: false
};

const iframe = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_IFRAME:
      return Object.assign({}, state, {
        selectedIframe: action.selectedIframe,
        iframeLoaded: false
      });
    case SET_IFRAME_LOADED:
      return Object.assign({}, state, {
        iframeLoaded: action.iframeLoaded
      });
    default:
      return state;
  }
};

export default iframe;