import {
  API_REQUEST,
  API_REQUEST_FAILED,
  API_REQUEST_SUCCESS
} from '../actions/actionConstants';

const initialState = {
  apiOperationInProgress: false,
  apiOperationFailed: false,
  err: null
};

const iframe = (state = initialState, action) => {
  switch (action.type) {
    case API_REQUEST:
      return Object.assign({}, state, {
        apiOperationInProgress: true,
        apiOperationFailed: false,
        err: null
      });
    case API_REQUEST_SUCCESS:
      return Object.assign({}, state, {
        apiOperationInProgress: false,
        apiOperationFailed: false,
        err: null
      });
    case API_REQUEST_FAILED:
      return Object.assign({}, state, {
        apiOperationInProgress: false,
        apiOperationFailed: true,
        err: action.err
      });
    default:
      return state;
  }
};

export default iframe;