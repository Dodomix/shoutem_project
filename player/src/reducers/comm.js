import {SET_COMMUNICATOR} from "../actions/actionConstants";

const initialState = {};

const comm = (state = initialState, action) => {
  switch (action.type) {
    case SET_COMMUNICATOR:
      return Object.assign({}, state, {
        communicator: action.communicator
      });
    default:
      return state;
  }
};

export default comm;