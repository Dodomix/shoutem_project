import {
  SET_TEXT
} from '../actions/actionConstants';

const initialState = {
  text: '',
  style: {}
};

const text = (state = initialState, action) => {
  switch (action.type) {
    case SET_TEXT:
      return Object.assign({}, state, {
        text: action.text.text,
        style: action.text.style
      });
    default:
      return state;
  }
};

export default text;