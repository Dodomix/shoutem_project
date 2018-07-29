import {
  SET_TEXT,
  SET_STYLE,
  SET_FONT_FAMILY,
  SET_FONT_SIZE,
  SET_FONT_STYLE,
  SET_COLOR
} from '../actions/actionConstants';

const initialState = {
  text: '',
  style: {
    fontFamily: 'Arial',
    fontStyle: {
      type: 'textDecoration',
      value: 'underline'
    },
    color: 'black',
    fontSize: 15
  }
};

const text = (state = initialState, action) => {
  switch (action.type) {
    case SET_TEXT:
      return Object.assign({}, state, {
        text: action.text
      });
    case SET_STYLE:
      return Object.assign({}, state, {
        style: Object.assign({}, state.style, action.style)
      });
    case SET_FONT_FAMILY:
      return Object.assign({}, state, {
        style: Object.assign({}, state.style, {
          fontFamily: action.fontFamily
        })
      });
    case SET_FONT_STYLE:
      return Object.assign({}, state, {
        style: Object.assign({}, state.style, {
          fontStyle: action.fontStyle
        })
      });
    case SET_FONT_SIZE:
      return Object.assign({}, state, {
        style: Object.assign({}, state.style, {
          fontSize: action.fontSize
        })
      });
    case SET_COLOR:
      return Object.assign({}, state, {
        style: Object.assign({}, state.style, {
          color: action.color
        })
      });
    default:
      return state;
  }
};

export default text;