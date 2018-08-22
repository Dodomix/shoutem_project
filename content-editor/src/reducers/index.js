import { combineReducers } from 'redux';
import text from './text';
import comm from './comm';

export default combineReducers({
  text,
  comm
});