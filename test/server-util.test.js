const assert = require('assert');
const util = require('../server-util');

describe('server util', () => {
  it('squareToPosition converts the piece to the position', () => {
    assert.equal(util.squareToPosition('p', 'a4'), 'p@a4');
  });

  it('toggleCurrentPlayer if the player is white converts it to black', () => {
    const state = {
      currentPlayer: 'white'
    };
    util.toggleCurrentPlayer(state);

    assert.equal(state.currentPlayer, 'black');
  });

  it('toggleCurrentPlayer if the player is black converts it to white', () => {
    const state = {
      currentPlayer: 'black'
    };
    util.toggleCurrentPlayer(state);

    assert.equal(state.currentPlayer, 'white');
  });

  it('getReadableState returns all readable state based on permissions', () => {
    assert.deepEqual(util.getReadableState({
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
    }, {
      read: ['a.a1.a11', 'a.a2', 'b']
    }), {
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

  it('hasPermission returns true if the state update contains only permitted updates', () => {
    assert.equal(util.hasPermission({
      write: ['a.a1', 'b', 'c']
    }, {
      a: {
        a1: '123'
      },
      b: {
        b1: '3'
      }
    }), true);
  });

  it('hasPermission returns true if there is an update which is not permitted', () => {
    assert.equal(util.hasPermission({
      write: ['a.a1', 'b']
    }, {
      a: {
        a1: '123'
      },
      b: {
        b1: '3'
      },
      c: {
        c1: '5'
      }
    }), false);
  });

  it('hasPermission returns true if there is an update which is not permitted', () => {
    assert.equal(util.hasPermission({
      write: ['a.a1', 'b']
    }, {
      a: {
        a1: '123',
        a2: '10'
      },
      b: {
        b1: '3'
      }
    }), false);
  });
});