import CommunicatorChild from './CommunicatorChild';
import {
  DATA_REQUEST,
  DATA_RESPONSE,
  REGISTER,
  REQUEST_FAILED,
  REQUEST_SUCCEEDED,
  STATE_UPDATED,
  UPDATE_STATE
} from "./responseTypeConstants";

let communicatorChild;

beforeEach(() => communicatorChild = new CommunicatorChild());

test('_postMessageToParent fetches the token and posts the message including the token to the parent component', done => {
  communicatorChild.fetchToken = jest.fn(() => Promise.resolve('token1'));
  communicatorChild.parentSourceWindow = {
    postMessage: (message, origin) => {
      expect(message).toEqual({
        is: 'message',
        token: 'token1'
      });
      expect(origin).toEqual('http://localhost:3000');
      done();
    }
  };

  communicatorChild._postMessageToParent({
    is: 'message'
  });
});

test('fetchToken makes the correct api call', done => {
  communicatorChild._callApi = jest.fn(() => Promise.resolve({
    is: 'body',
    token: 'token1'
  }));

  communicatorChild.fetchToken().then(token => {
    expect(token).toEqual('token1');
    expect(communicatorChild._callApi.mock.calls.length).toEqual(1);
    expect(communicatorChild._callApi.mock.calls[0][0]).toEqual('/api/token');
    done();
  });
});

test('sendUpdateState sends the update state message to the parent', () => {
  communicatorChild._postMessageToParent = jest.fn();

  communicatorChild.sendUpdateState({
    is: 'stateUpdate'
  });

  expect(communicatorChild._postMessageToParent.mock.calls.length).toEqual(1);
  expect(communicatorChild._postMessageToParent.mock.calls[0][0]).toEqual({
    type: UPDATE_STATE,
    stateUpdate: {
      is: 'stateUpdate'
    }
  })
});

test('Calls the error handler if a message is received from invalid origin', () => {
  communicatorChild.handlers.onInvalidOrigin = jest.fn();

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3001'
  });

  expect(communicatorChild.handlers.onInvalidOrigin.mock.calls[0][0]).toEqual('http://localhost:3001');
});

test('If the parent sends the register message, it\'s source window is saved and it is sent a data request message', done => {
  const parentSource = {
    is: 'parentSource',
    postMessage: jest.fn()
  };
  communicatorChild.fetchToken = jest.fn(() => Promise.resolve('token1'));

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: parentSource,
    data: {
      type: REGISTER
    }
  });

  setTimeout(() => {
    expect(parentSource.postMessage.mock.calls.length).toEqual(1);
    expect(parentSource.postMessage.mock.calls[0][0]).toEqual({
      type: DATA_REQUEST,
      token: 'token1'
    });
    expect(parentSource.postMessage.mock.calls[0][1]).toEqual('http://localhost:3000');
    done();
  }, 0);
});

test('Calls the error handler if a message is received from a source which is not the parent', () => {
  communicatorChild.handlers.onInvalidSource = jest.fn();
  const contentWindow = {
    is: 'contentWindow'
  };
  const fakeContentWindow = {
    is: 'fakeContentWindow'
  };
  communicatorChild.parentSourceWindow = contentWindow;

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: fakeContentWindow
  });

  expect(communicatorChild.handlers.onInvalidSource.mock.calls[0][0]).toEqual({
    is: 'fakeContentWindow'
  });
});

test('On data response message, calls the onReceiveState handler', () => {
  communicatorChild.handlers.onReceiveState = jest.fn();
  const parentSource = {
    is: 'parentSource'
  };
  communicatorChild.parentSourceWindow = parentSource;

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: parentSource,
    data: {
      type: DATA_RESPONSE,
      state: {
        is: 'newState'
      }
    }
  });

  expect(communicatorChild.handlers.onReceiveState.mock.calls.length).toEqual(1);
  expect(communicatorChild.handlers.onReceiveState.mock.calls[0][0]).toEqual({
    is: 'newState'
  });
});

test('On data request succeeded message, calls the correct handler', () => {
  communicatorChild.handlers.onRequestSucceeded = jest.fn();
  const parentSource = {
    is: 'parentSource'
  };
  communicatorChild.parentSourceWindow = parentSource;

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: parentSource,
    data: {
      type: REQUEST_SUCCEEDED
    }
  });

  expect(communicatorChild.handlers.onRequestSucceeded.mock.calls.length).toEqual(1);
});

test('On data request failed message, calls the correct handler', () => {
  communicatorChild.handlers.onRequestFailed = jest.fn();
  const parentSource = {
    is: 'parentSource'
  };
  communicatorChild.parentSourceWindow = parentSource;

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: parentSource,
    data: {
      type: REQUEST_FAILED,
      reason: 'Forbidden'
    }
  });

  expect(communicatorChild.handlers.onRequestFailed.mock.calls.length).toEqual(1);
  expect(communicatorChild.handlers.onRequestFailed.mock.calls[0][0]).toEqual('Forbidden');
});

test('On state updated message, calls the correct handler and requests state data from parent', done => {
  communicatorChild.handlers.onStateUpdated = jest.fn();
  communicatorChild.fetchToken = jest.fn(() => Promise.resolve('token1'));
  const parentSource = {
    is: 'parentSource',
    postMessage: jest.fn()
  };
  communicatorChild.parentSourceWindow = parentSource;

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: parentSource,
    data: {
      type: STATE_UPDATED
    }
  });

  setTimeout(() => {
    expect(communicatorChild.handlers.onStateUpdated.mock.calls.length).toEqual(1);
    expect(parentSource.postMessage.mock.calls.length).toEqual(1);
    expect(parentSource.postMessage.mock.calls[0][0]).toEqual({
      type: DATA_REQUEST,
      token: 'token1'
    });
    done();
  }, 1);
});


test('Calls the unknown message handler if receives an unknown message type', () => {
  communicatorChild.handlers.onUnknownMessage = jest.fn();
  const parentSource = {
    is: 'parentSource',
    postMessage: () => {}
  };
  communicatorChild.parentSourceWindow = parentSource;

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: parentSource,
    data: {
      type: STATE_UPDATED
    }
  });

  communicatorChild._messageEventHandler({
    origin: 'http://localhost:3000',
    source: parentSource,
    data: {
      type: 'some unknown type'
    }
  });

  expect(communicatorChild.handlers.onUnknownMessage.mock.calls.length).toEqual(1);
  expect(communicatorChild.handlers.onUnknownMessage.mock.calls[0][0]).toEqual('some unknown type');
});