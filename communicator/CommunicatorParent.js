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
import * as jwt from 'jsonwebtoken';
import pubFile from './public.pem';

const noop = () => {};
const defaultHandlers = {
  getReadableState: noop,
  updateState: () => Promise.resolve(),
  onInvalidOrigin: noop,
  onInvalidSource: noop,
  onUnknownMessage: noop
};

export default class CommunicatorParent {
  constructor(handlers) {
    this.handlers = Object.assign({}, defaultHandlers, handlers);
  }

  async initialize(components) {
    if (!window) {
      throw new Error('Browser window is required to initialize communicator');
    }

    this.components = components;

    this.pub = await (await fetch(pubFile)).text();

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
      let tokenData;
      try {
        tokenData = this._verifyToken(e.data.token);
      } catch (ex) {
        if (ex.name === 'TokenExpiredError') {
          this._postMessageToIframeComponent(component, {
            type: TOKEN_EXPIRED
          });
        } else {
          this._postMessageToIframeComponent(component, {
            type: REQUEST_FAILED,
            reason: 'Cannot verify token'
          });
        }
        return;
      }
      if (e.origin !== tokenData.origin) {
        return this._postMessageToIframeComponent(component, {
          type: REQUEST_FAILED,
          reason: 'Invalid origin'
        });
      }
      if (e.data.type === DATA_REQUEST) {
        this._postMessageToIframeComponent(component, {
          type: DATA_RESPONSE,
          state: this.handlers.getReadableState(tokenData.permissions.read)
        });
      } else if (e.data.type === UPDATE_STATE) {
        this.handlers.updateState(e.data.stateUpdate, tokenData.permissions.write).then(() => {
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

  _verifyToken(token) {
    return jwt.verify(token, this.pub, {algorithm: 'RS512'});
  }
}