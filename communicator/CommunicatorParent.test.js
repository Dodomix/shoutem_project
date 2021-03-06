import CommunicatorParent from './CommunicatorParent';
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

let communicatorParent;

beforeEach(() => communicatorParent = new CommunicatorParent());

test('_executeForEachComponent executes given action for each component', () => {
  const components = {
    c1: {
      key: 'c1',
      value: 10
    },
    c2: {
      key: 'c2',
      value: 20
    },
    c3: {
      key: 'c3',
      value: 15
    }
  };

  communicatorParent._executeForEachComponent(components, c => c.value *= 2);

  expect(components).toEqual({
    c1: {
      key: 'c1',
      value: 20
    },
    c2: {
      key: 'c2',
      value: 40
    },
    c3: {
      key: 'c3',
      value: 30
    }
  });
});

test('_postMessageToIframeComponent posts message to the given iframe component', done => {
  const component = {
    origin: 'http://localhost:3000',
    iframe: {
      contentWindow: {
        postMessage: (message, origin) => {
          expect(message).toEqual({
            is: 'message'
          });
          expect(origin).toEqual('http://localhost:3000');
          done();
        }
      }
    }
  };

  communicatorParent._postMessageToIframeComponent(component, {
    is: 'message'
  });
});

test('After loading, each component receives the register message', done => {
  window.fetch = () => Promise.resolve({
    text: () => Promise.resolve('')
  });
  const components = {
    c1: {
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
          action(); // execute right away
        },
        contentWindow: {
          postMessage: message => {
            expect(message.type).toEqual(REGISTER);
            done();
          }
        }
      }
    },
    c2: {
      iframe: {
        addEventListener: (eventName) => {
          expect(eventName).toEqual('load');
        }
      }
    }
  };

  communicatorParent.initialize(components);
});

test('If token origin does not match, sends request failed message', done => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token');
    return {
      origin: 'http://localhost:3002'
    };
  };
  const contentWindow = {
    postMessage: message => {
      expect(message.type).toEqual(REQUEST_FAILED);
      done();
    }
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST,
      token: 'token'
    }
  });
});

test('If token fails to get verified, sends request failed message', done => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token');
    throw {};
  };
  const contentWindow = {
    postMessage: message => {
      expect(message.type).toEqual(REQUEST_FAILED);
      done();
    }
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST,
      token: 'token'
    }
  });
});

test('If token expired, sends token expired message', done => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token');
    throw {
      name: 'TokenExpiredError'
    };
  };
  const contentWindow = {
    postMessage: message => {
      expect(message.type).toEqual(TOKEN_EXPIRED);
      done();
    }
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST,
      token: 'token'
    }
  });
});

test('If receives a data request, fetches data and sends a data response', done => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token');
    return {
      origin: 'http://localhost:3001',
      permissions: {
        read: ['read']
      }
    };
  };
  communicatorParent.handlers.getReadableState = permissions => {
    expect(permissions).toEqual(['read']);
    return {
      is: 'state'
    };
  };
  const contentWindow = {
    postMessage: message => {
      expect(message.type).toEqual(DATA_RESPONSE);
      expect(message.state).toEqual({
        is: 'state'
      });
      done();
    }
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST,
      token: 'token'
    }
  });
});

test('Calls the error handler if a message is received from invalid origin', () => {
  communicatorParent.handlers.onInvalidOrigin = jest.fn();
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3002'
  });

  expect(communicatorParent.handlers.onInvalidOrigin.mock.calls[0][0]).toEqual('http://localhost:3002');
});

test('Calls the error handler if a message is received from a source which does not match the origin', () => {
  communicatorParent.handlers.onInvalidSource = jest.fn();
  const contentWindow = {
    is: 'contentWindow'
  };
  const fakeContentWindow = {
    is: 'fakeContentWindow'
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow
      }
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: fakeContentWindow
  });

  expect(communicatorParent.handlers.onInvalidSource.mock.calls[0][0]).toEqual({
    is: 'fakeContentWindow'
  });
});

test('If receives a data request, fetches data and sends a data response', done => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token');
    return {
      origin: 'http://localhost:3001',
      permissions: {
        read: ['read']
      }
    };
  };
  communicatorParent.handlers.getReadableState = jest.fn(() => ({
    is: 'state'
  }));
  const contentWindow = {
    postMessage: message => {
      expect(message.type).toEqual(DATA_RESPONSE);
      expect(message.state).toEqual({
        is: 'state'
      });
      done();
    }
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST,
      token: 'token'
    }
  });
});

test('If receives a request to update state, updates it and sends a request successful response and update state response', done => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token1');
    return {
      origin: 'http://localhost:3001',
      permissions: {
        write: ['write']
      }
    };
  };
  communicatorParent.handlers.updateState = jest.fn((stateUpdate, permissions) => {
    expect(stateUpdate).toEqual({
      a: {
        b: 3
      }
    });
    expect(permissions).toEqual(['write']);
    return Promise.resolve();
  });
  communicatorParent.handlers.onUpdateStateRequest = jest.fn();
  const contentWindow1 = {
    postMessage: jest.fn()
  };
  const contentWindow2 = {
    postMessage: jest.fn()
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow1
      }
    },
    c2: {
      origin: 'http://localhost:3002',
      iframe: {
        contentWindow: contentWindow2
      }
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow1,
    data: {
      type: UPDATE_STATE,
      token: 'token1',
      stateUpdate: {
        a: {
          b: 3
        }
      }
    }
  });

  setTimeout(() => { // run after async calls since jest doesn't have flush
    expect(contentWindow1.postMessage.mock.calls.length).toEqual(2);
    expect(contentWindow1.postMessage.mock.calls[0][0]).toEqual({
      type: REQUEST_SUCCEEDED
    });
    expect(contentWindow1.postMessage.mock.calls[1][0]).toEqual({
      type: STATE_UPDATED
    });
    expect(contentWindow2.postMessage.mock.calls.length).toEqual(1);
    expect(contentWindow2.postMessage.mock.calls[0][0]).toEqual({
      type: STATE_UPDATED
    });
    done();
  }, 0);
});

test('If receives a request to update state and update fails, sends a message about failed request', done => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token1');
    return {
      origin: 'http://localhost:3001',
      permissions: {
        write: ['write']
      }
    };
  };
  communicatorParent.handlers.updateState = jest.fn(() => Promise.reject({
    message: 'Request not valid'
  }));
  const contentWindow1 = {
    postMessage: jest.fn()
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow1
      }
    },
    c2: {
      origin: 'http://localhost:3002'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow1,
    data: {
      type: UPDATE_STATE,
      token: 'token1',
      stateUpdate: {
        a: {
          b: 3
        }
      }
    }
  });

  setTimeout(() => { // run after async calls since jest doesn't have flush
    expect(contentWindow1.postMessage.mock.calls[0][0]).toEqual({
      type: REQUEST_FAILED,
      reason: 'Request not valid'
    });
    done();
  }, 0);
});

test('Calls the unknown message handler if receives an unknown message type', () => {
  communicatorParent._verifyToken = token => {
    expect(token).toEqual('token1');
    return {
      origin: 'http://localhost:3001'
    };
  };
  communicatorParent.handlers.onUnknownMessage = jest.fn();
  const contentWindow1 = {
    postMessage: jest.fn()
  };
  communicatorParent.components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        contentWindow: contentWindow1
      }
    },
    c2: {
      origin: 'http://localhost:3002'
    }
  };

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow1,
    data: {
      type: 'some unknown type',
      token: 'token1'
    }
  });

  expect(communicatorParent.handlers.onUnknownMessage.mock.calls.length).toEqual(1);
  expect(communicatorParent.handlers.onUnknownMessage.mock.calls[0][0]).toEqual('some unknown type');
});