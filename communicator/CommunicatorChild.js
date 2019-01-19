import {
  DATA_REQUEST,
  DATA_RESPONSE,
  REGISTER,
  REQUEST_FAILED,
  REQUEST_SUCCEEDED,
  STATE_UPDATED,
  TOKEN_EXPIRED,
  UPDATE_STATE
} from './responseTypeConstants';

const noop = () => {};
const defaultHandlers = {
  onInvalidOrigin: noop,
  onInvalidSource: noop,
  onReceiveState: noop,
  onRequestSucceeded: noop,
  onRequestFailed: noop,
  onStateUpdated: noop,
  onFetchTokenFailed: noop,
  onUnknownMessage: noop,
  onTokenExpired: noop
};

export default class CommunicatorChild {
  constructor(serverUrl, parentOrigin, handlers) {
    this.server = serverUrl;
    this.parentOrigin = parentOrigin;
    this.handlers = Object.assign({}, defaultHandlers, handlers);
  }

  initialize() {
    if (!window) {
      throw 'Browser window is required to initialize communicator';
    }

    window.addEventListener('message', this._messageEventHandler.bind(this));
  }

  _messageEventHandler(e) {
    if (e.source === window) { // react messages
      return;
    }
    if (e.origin !== this.parentOrigin) {
      this.handlers.onInvalidOrigin(e.origin);
    } else {
      if (!this.parentSourceWindow && e.data.type === REGISTER) {
        this.parentSourceWindow = e.source;
        this._postMessageToParent({
          type: DATA_REQUEST
        });
      } else if (this.parentSourceWindow !== e.source) {
        this.handlers.onInvalidSource(e.source);
      } else {
        switch (e.data.type) {
          case DATA_RESPONSE:
            this.handlers.onReceiveState(e.data.state);
            break;
          case REQUEST_SUCCEEDED:
            this.handlers.onRequestSucceeded();
            break;
          case REQUEST_FAILED:
            this.handlers.onRequestFailed(e.data.reason);
            break;
          case STATE_UPDATED:
            this.handlers.onStateUpdated();
            this._postMessageToParent({
              type: DATA_REQUEST
            });
            break;
          case TOKEN_EXPIRED:
            this.handlers.onTokenExpired();
            this.token = null;
            this._postMessageToParent(this.lastMessage); // retry last call
            break;
          default:
            this.handlers.onUnknownMessage(e.data.type);
        }
      }
    }
  }

  sendUpdateState(stateUpdate) {
    this._postMessageToParent({
      type: UPDATE_STATE,
      stateUpdate: stateUpdate
    });
  }

  _postMessageToParent(message) {
    if (!this.token) {
      this.fetchToken().then(token => {
        this.token = token;
        this._postMessageWithTokenToParent(message, this.token);
      });
    } else {
      this._postMessageWithTokenToParent(message, this.token);
    }
  }

  _postMessageWithTokenToParent(message, token) {
    this.lastMessage = message;
    return this.parentSourceWindow.postMessage(Object.assign({token}, message), this.parentOrigin);
  }

  fetchToken() {
    return this._callApi('/api/token').then(body => {
      return body.token;
    }).catch(err => {
      this.handlers.onFetchTokenFailed(err.message.substr(4));
    });
  }

  async _callApi(path, options) {
    const response = await fetch(`${this.server}${path}`, options);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  }
}