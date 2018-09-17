import { combineReducers } from 'redux';
import comm from './comm';
import board from './board';

export default combineReducers({
  comm,
  board
});