import {
  DATA_REQUEST,
  DATA_RESPONSE,
  REGISTER,
  REQUEST_FAILED,
  REQUEST_SUCCEEDED,
  STATE_UPDATED,
  UPDATE_STATE
} from "./responseTypeConstants";

const noop = () => {};
const defaultHandlers = {
  onInvalidOrigin: noop,
  onInvalidSource: noop,
  onUnknownMessage: noop,
  getReadableState: noop,
  updateState: () => Promise.resolve()
};

export default class CommunicatorParent {
  constructor(handlers) {
    this.server = 'http://localhost:5000';
    this.handlers = Object.assign({}, defaultHandlers, handlers);
  }

  initialize(components) {
    if (!window) {
      throw new Error("Browser window is required to initialize communicator");
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

  notifyStateUpdated() {
    this._executeForEachComponent(this.components, component => this._postMessageToIframeComponent(component, {
      type: STATE_UPDATED
    }));
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
        try {
          this._postMessageToIframeComponent(component, {
            type: DATA_RESPONSE,
            state: this.handlers.getReadableState(e.origin, e.data.token)
          });
        } catch (err) {
          this._postMessageToIframeComponent(component, {
            type: REQUEST_FAILED,
            reason: err.message
          });
        }
      } else if (e.data.type === UPDATE_STATE) {
        this.handlers.updateState({
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
};