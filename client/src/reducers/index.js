import { combineReducers } from 'redux';
import text from './text';
import iframe from './iframe';

export default combineReducers({
  text,
  iframe
});