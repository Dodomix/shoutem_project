import {combineReducers} from 'redux';
import iframe from './iframe';
import chessState from './chessState';

export default combineReducers({
  iframe,
  chessState
});