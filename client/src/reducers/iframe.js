import {
  ASSIGN_IFRAME,
  SET_IFRAME_LOADED
} from '../actions/actionConstants';

const initialState = {
  components: {
    player1: {
      origin: 'http://localhost:3001'
    },
    player2: {
      origin: 'http://localhost:3002'
    }
  }
};

const iframe = (state = initialState, action) => {
  switch (action.type) {
    case SET_IFRAME_LOADED:
      const loadedUpdate = {};
      Object.assign(loadedUpdate, state);
      Object.assign(loadedUpdate.components[action.iframe], {
        iframeLoaded: action.loaded
      });
      return Object.assign({}, state, loadedUpdate);
    case ASSIGN_IFRAME:
      const assignUpdate = {};
      Object.assign(assignUpdate, state);
      Object.assign(assignUpdate.components[action.iframeName], {
        iframe: action.ref
      });
      return Object.assign({}, state, assignUpdate);
    default:
      return state;
  }
};

export default iframe;