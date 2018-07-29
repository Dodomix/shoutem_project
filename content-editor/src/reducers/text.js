import {
  SET_TEXT
} from '../actions/actionConstants';

const initialState = {
  text: ''
};

const text = (state = initialState, action) => {
  switch (action.type) {
    case SET_TEXT:
      return Object.assign({}, state, {
        text: action.text
      });
    default:
      return state;
  }
};

export default text;