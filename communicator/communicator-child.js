import {
  DATA_REQUEST,
  DATA_RESPONSE, REQUEST_FAILED,
  REQUEST_SUCCEEDED,
  STATE_UPDATED,
  UPDATE_STATE,
  REGISTER
} from "./responseTypeConstants";

export default class CommunicatorChild {
  constructor(onReceiveState) {
    if (!window) {
      throw "Browser window is required to initialize communicator";
    }

    this.server = 'http://localhost:5001';
    this.parentOrigin = 'http://localhost:3000';

    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== this.parentOrigin) {
        alert('Component received message with invalid origin: ' + e.origin);
      } else {
        if (!this.sourceWindow && e.data.type === REGISTER) {
          this.sourceWindow = e.source;
          this._postMessageToParent({
            type: DATA_REQUEST
          });
        } else if (this.sourceWindow !== e.source) {
          alert('Component received message with invalid source.');
        } else {
          switch (e.data.type) {
            case DATA_RESPONSE:
              if (onReceiveState) {
                onReceiveState(e.data.state);
              }
              break;
            case REQUEST_SUCCEEDED:
              break;
            case REQUEST_FAILED:
              break;
            case STATE_UPDATED:
              this._postMessageToParent({
                type: DATA_REQUEST
              });
              break;
            default:
              alert('Unrecognized message type: ' + e.data.type);
          }
        }
      }
    });
  }

  sendUpdateState(stateUpdate) {
    this._postMessageToParent({
      type: UPDATE_STATE,
      stateUpdate: stateUpdate
    });
  }

  _postMessageToParent(message) {
    return this.fetchToken()
      .then(token => this.sourceWindow.postMessage(
        Object.assign({token}, message), this.parentOrigin));
  }

  fetchToken() {
    return this._callApi('/api/token').then(body => {
      return body.token;
    }).catch(err => {
      console.log(err);
      alert('Cannot fetch token');
    });
  };

  async _callApi(path, options) {
    const response = await fetch(`${this.server}${path}`, options);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };
}