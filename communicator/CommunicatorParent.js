import {
  DATA_REQUEST,
  DATA_RESPONSE,
  REGISTER,
  REQUEST_FAILED,
  REQUEST_SUCCEEDED,
  STATE_UPDATED,
  UPDATE_STATE
} from "./responseTypeConstants";

const noop = () => {
};
const defaultHandlers = {
  onInvalidOrigin: noop,
  onInvalidSource: noop,
  onDataRequest: noop,
  onUpdateStateRequest: noop,
  onFetchFailed: noop,
  onPostFailed: noop,
  onUnknownMessage: noop
};

export default class CommunicatorParent {
  constructor(handlers) {
    this.server = 'http://localhost:5000';
    this.handlers = Object.assign({}, defaultHandlers, handlers);
  }

  initialize(components) {
    if (!window) {
      throw "Browser window is required to initialize communicator";
    }

    this.components = components;

    this._executeForEachComponent(this.components, component => {
      component.iframe.addEventListener('load', () => {
        this._postMessageToIframeComponent(component, {
          type: REGISTER
        });
      });
    });

    window.addEventListener('message', this._messageEventHandler.bind(this));
  }

  _messageEventHandler(e) {
    if (e.source === window) { // react messages
      return;
    }
    const component = this.components[Object.keys(this.components).find(key => this.components[key].origin === e.origin)];
    if (!component) {
      this.handlers.onInvalidOrigin(e.origin);
    } else if (component.iframe.contentWindow !== e.source) {
      this.handlers.onInvalidSource(e.source);
    } else {
      if (e.data.type === DATA_REQUEST) {
        this.handlers.onDataRequest();
        this.fetchState(e.origin, e.data.token).then(state => {
          this._postMessageToIframeComponent(component, {
            type: DATA_RESPONSE,
            state: state
          });
        }).catch(err => {
          this._postMessageToIframeComponent(component, {
            type: REQUEST_FAILED,
            reason: err.message
          });
        });
      } else if (e.data.type === UPDATE_STATE) {
        this.handlers.onUpdateStateRequest(e.data.stateUpdate);
        this.postState({
          token: e.data.token,
          stateUpdate: e.data.stateUpdate,
          origin: e.origin
        }).then(() => {
          this._postMessageToIframeComponent(component, {
            type: REQUEST_SUCCEEDED
          });
          this._executeForEachComponent(this.components, component => this._postMessageToIframeComponent(component, {
            type: STATE_UPDATED
          }));
        }).catch(err => {
          this._postMessageToIframeComponent(component, {
            type: REQUEST_FAILED,
            reason: err.message
          });
        });
      } else {
        this.handlers.onUnknownMessage(e.data.type);
      }
    }
  }

  _executeForEachComponent(components, action) {
    return Object.keys(components).forEach(key => action(components[key], key));
  }

  _postMessageToIframeComponent(component, message) {
    return component.iframe.contentWindow.postMessage(message, component.origin);
  }

  fetchState(origin, token) {
    return this._callApi(`/api/state?origin=${encodeURIComponent(origin)}&token=${encodeURIComponent(token)}`, {
      headers: {
        'Accept': 'application/json'
      },
    }).then(body => {
      return body;
    }).catch(err => {
      this.handlers.onFetchFailed(err.message);
      throw err; // rethrow error
    });
  }

  postState(data) {
    return this._callApi('/api/state', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(err => {
      this.handlers.onPostFailed(err.message.substr(4));
      throw err; // rethrow error
    });
  }

  async _callApi(path, options) {
    const response = await fetch(`${this.server}${path}`, options);
    const body = await response.json();

    if (response.status !== 200) throw Error(`${response.status} ${body.message}`);

    return body;
  };
}
