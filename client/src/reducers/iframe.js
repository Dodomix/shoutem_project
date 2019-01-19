import {ASSIGN_IFRAME, SET_COMMUNICATOR} from '../actions/actionConstants';

const initialState = {
  components: {
    player1: {
      origin: 'http://localhost:3001'
    },
    player2: {
      origin: 'http://localhost:3002'
    }
  },
  communicator: null
};

const iframe = (state = initialState, action) => {
  switch (action.type) {
    case SET_COMMUNICATOR:
      return Object.assign({}, state, {
        communicator: action.communicator
      });
    case ASSIGN_IFRAME: {
      const assignUpdate = {};
      Object.assign(assignUpdate, state);
      Object.assign(assignUpdate.components[action.iframeName], {
        iframe: action.ref
      });
      return Object.assign({}, state, assignUpdate);
    }
    default:
      return state;
  }
};

export default iframe;