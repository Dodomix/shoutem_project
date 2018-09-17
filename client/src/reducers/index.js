import { combineReducers } from 'redux';
import iframe from './iframe';
import api from './api';

export default combineReducers({
  iframe,
  api
});