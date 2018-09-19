import CommunicatorParent from './CommunicatorParent';
import {
  DATA_REQUEST,
  DATA_RESPONSE,
  REGISTER, REQUEST_FAILED,
  REQUEST_SUCCEEDED,
  STATE_UPDATED,
  UPDATE_STATE
} from "./responseTypeConstants";

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
  })
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

test('fetchState makes the correct api call', done => {
  communicatorParent._callApi = jest.fn(() => Promise.resolve({
    is: 'body'
  }));

  communicatorParent.fetchState('localhost', 'token').then(body => {
    expect(body).toEqual({
      is: 'body'
    });
    expect(communicatorParent._callApi.mock.calls.length).toEqual(1);
    expect(communicatorParent._callApi.mock.calls[0][0]).toEqual('/api/state?origin=localhost&token=token');
    expect(communicatorParent._callApi.mock.calls[0][1]).toEqual({
      headers: {
        'Accept': 'application/json'
      },
    });
    done();
  });
});

test('fetchState in case of error shows an alert with the message', done => {
  communicatorParent._callApi = jest.fn(() => Promise.reject({
      message: '403 Access forbidden'
    }));
  window.alert = jest.fn();

  communicatorParent.fetchState().catch(err => {
    expect(err).toEqual({
      message: '403 Access forbidden'
    });
    expect(window.alert.mock.calls[0][0]).toEqual('Access forbidden');
    done();
  });
});

test('postState makes the correct api call', done => {
  communicatorParent._callApi = jest.fn(() => Promise.resolve());

  communicatorParent.postState({
    is: 'state-update'
  }).then(() => {
    expect(communicatorParent._callApi.mock.calls.length).toEqual(1);
    expect(communicatorParent._callApi.mock.calls[0][0]).toEqual('/api/state');
    expect(communicatorParent._callApi.mock.calls[0][1]).toEqual({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: '{"is":"state-update"}'
    });
    done();
  });
});

test('postState in case of error shows an alert with the message', done => {
  communicatorParent._callApi = jest.fn(() => Promise.reject({
    message: '403 Access forbidden'
  }));
  window.alert = jest.fn();

  communicatorParent.postState().catch(err => {
    expect(err).toEqual({
      message: '403 Access forbidden'
    });
    expect(window.alert.mock.calls[0][0]).toEqual('Access forbidden');
    done();
  });
});

test('After loading, each component receives the register message', done => {
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
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        }
      }
    }
  };

  communicatorParent.initialize(components);
});

test('If receives a data request, fetches data and sends a data response', done => {
  communicatorParent.fetchState = jest.fn(() => Promise.resolve({
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
  const components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        },
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        }
      }
    }
  };
  communicatorParent.initialize(components);

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST
    }
  });
});

test('Shows an alert if a message is received from invalid origin', () => {
  window.alert = jest.fn();
  const components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        }
      }
    }
  };
  communicatorParent.initialize(components);

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3002'
  });

  expect(window.alert.mock.calls[0][0]).toEqual('Received message with unknown origin: http://localhost:3002');
});

test('Shows an alert if a message is received from a source which does not match the origin', () => {
  window.alert = jest.fn();
  const contentWindow = {
    is: 'contentWindow'
  };
  const fakeContentWindow = {
    is: 'fakeContentWindow'
  };
  const components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        },
        contentWindow: contentWindow
      }
    }
  };
  communicatorParent.initialize(components);

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: fakeContentWindow
  });

  expect(window.alert.mock.calls[0][0]).toEqual('Received message with unknown source.');
});

test('If receives a data request, fetches data and sends a data response', done => {
  communicatorParent.fetchState = jest.fn(() => Promise.resolve({
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
  const components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        },
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        }
      }
    }
  };
  communicatorParent.initialize(components);

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST
    }
  });
});

test('If receives a data request, and it fails, sends a request failed message', done => {
  communicatorParent.fetchState = jest.fn(() => Promise.reject({
    message: 'Request refused'
  }));
  const contentWindow = {
    postMessage: message => {
      expect(message).toEqual({
        type: REQUEST_FAILED,
        reason: 'Request refused'
      });
      done();
    }
  };
  const components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        },
        contentWindow: contentWindow
      }
    },
    c2: {
      origin: 'http://localhost:3002',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        }
      }
    }
  };
  communicatorParent.initialize(components);

  communicatorParent._messageEventHandler({
    origin: 'http://localhost:3001',
    source: contentWindow,
    data: {
      type: DATA_REQUEST
    }
  });
});

test('If receives a request to update state, updates it and sends a request successful response and update state response', done => {
  communicatorParent.postState = jest.fn(data => {
    expect(data).toEqual({
      token: 'token1',
      stateUpdate: {
        a: {
          b: 3
        }
      },
      origin: 'http://localhost:3001'
    });
    return Promise.resolve();
  });
  const contentWindow1 = {
    postMessage: jest.fn()
  };
  const contentWindow2 = {
    postMessage: jest.fn()
  };
  const components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        },
        contentWindow: contentWindow1
      }
    },
    c2: {
      origin: 'http://localhost:3002',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        },
        contentWindow: contentWindow2
      }
    }
  };
  communicatorParent.initialize(components);

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
      type: REQUEST_SUCCEEDED
    });
    expect(contentWindow1.postMessage.mock.calls[1][0]).toEqual({
      type: STATE_UPDATED
    });
    expect(contentWindow2.postMessage.mock.calls[0][0]).toEqual({
      type: STATE_UPDATED
    });
    done();
  }, 0);
});

test('If receives a request to update state and update fails, sends a message about failed request', done => {
  communicatorParent.postState = jest.fn(() => Promise.reject({
    message: 'Request not valid'
  }));
  const contentWindow1 = {
    postMessage: jest.fn()
  };
  const components = {
    c1: {
      origin: 'http://localhost:3001',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        },
        contentWindow: contentWindow1
      }
    },
    c2: {
      origin: 'http://localhost:3002',
      iframe: {
        addEventListener: (eventName, action) => {
          expect(eventName).toEqual('load');
        }
      }
    }
  };
  communicatorParent.initialize(components);

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