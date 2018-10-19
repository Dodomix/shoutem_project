import React from 'react';
import {App} from '../App';

let app;

beforeEach(() => app = new App());

test('hasPermission returns true if there is an update which is not permitted', () => {
  expect(app._hasPermission(['a.a1', 'b'], {
    a: {
      a1: '123'
    },
    b: {
      b1: '3'
    },
    c: {
      c1: '5'
    }
  })).toEqual(false);
});


it('getReadableState returns all readable state based on permissions', () => {
  expect(app._getReadableState({
    a: {
      a1: {
        a11: '123',
        a12: '2'
      },
      a2: {
        a21: '10',
        a22: '15'
      }
    },
    b: {
      b1: '3'
    },
    c: {
      c1: '5'
    }
  }, ['a.a1.a11', 'a.a2', 'b'])).toEqual({
    a: {
      a1: {
        a11: '123'
      },
      a2: {
        a21: '10',
        a22: '15'
      }
    },
    b: {
      b1: '3'
    }
  });
});

test('hasPermission returns true if the state update contains only permitted updates', () => {
  expect(app._hasPermission(['a.a1', 'b', 'c'], {
    a: {
      a1: '123'
    },
    b: {
      b1: '3'
    }
  })).toEqual(true);
});

test('hasPermission returns true if there is an update which is not permitted', () => {
  expect(app._hasPermission(['a.a1', 'b'], {
    a: {
      a1: '123'
    },
    b: {
      b1: '3'
    },
    c: {
      c1: '5'
    }
  })).toEqual(false);
});

test('hasPermission returns true if there is an update which is not permitted', () => {
  expect(app._hasPermission(['a.a1', 'b'], {
    a: {
      a1: '123',
      a2: '10'
    },
    b: {
      b1: '3'
    }
  })).toEqual(false);
});