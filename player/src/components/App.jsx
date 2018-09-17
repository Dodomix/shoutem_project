import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import './App.css';
import Chess from 'react-chess';

import {connect} from 'react-redux';
import {
  setSourceWindow,
  fetchToken,
  handleMovePiece,
  handleDragPiece,
  setBoardState
} from '../actions';

import {
  REGISTER,
  DATA_REQUEST,
  DATA_RESPONSE,
  REQUEST_SUCCEEDED,
  REQUEST_FAILED,
  UPDATE_STATE,
  STATE_UPDATED
} from '../responseTypeConstants';

class App extends Component {
  constructor(props) {
    super(props);
    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== 'http://localhost:3000') {
        alert('Component received message with invalid origin: ' + e.origin);
      } else {
        if (!this.props.sourceWindow && e.data.type === REGISTER) {
          this.props.setSourceWindow(e.source);
          this._postMessageToParent({
            type: DATA_REQUEST
          });
        } else if (this.props.sourceWindow !== e.source) {
          alert('Component received message with invalid source.');
        } else {
          switch (e.data.type) {
            case DATA_RESPONSE:
              this.props.setBoardState(e.data.state);
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
  };

  _handleDrag = (piece, start) => {
    const dragging = this.props.dragging;
    const savedPiece = this.props.piece;
    const dragAllowed = dragging || // if already dragging, the old piece was returned to its position
      savedPiece === null || // first move
      savedPiece.notation === piece.notation; // moving the same piece
    this.props.handleDragPiece(piece, start, dragAllowed);
    return dragAllowed;
  };

  _executeMove = () => {
    const move = {};
    move[this.props.currentPlayer] = this.props.move;
    this._postMessageToParent({
      type: UPDATE_STATE,
      stateUpdate: {
        move: move
      }
    });
  };

  _postMessageToParent = message => this.props.fetchToken()
    .then(token => this.props.sourceWindow.postMessage(
      Object.assign({token}, message), 'http://localhost:3000'));

  render() {
    return (
      <div className="App">
        <Chess pieces={this.props.pieces} onMovePiece={this.props.handleMovePiece} onDragStart={this._handleDrag}/>
        <Button className="save-button" onClick={this._executeMove}>Save</Button>
      </div>
    );
  };
}

// App.propTypes = {
//   text: PropTypes.string.isRequired,
//   sourceWindow: PropTypes.any,
//   setText: PropTypes.func.isRequired,
//   setSourceWindow: PropTypes.func.isRequired,
//   fetchToken: PropTypes.func.isRequired
// };

const mapStateToProps = state => {
  return {
    pieces: state.board.pieces,
    move: state.board.move,
    piece: state.board.piece,
    dragging: state.board.dragging,
    currentPlayer: state.board.currentPlayer,
    sourceWindow: state.comm.sourceWindow
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSourceWindow: sourceWindow => dispatch(setSourceWindow(sourceWindow)),
    fetchToken: () => dispatch(fetchToken()),
    handleMovePiece: (piece, start, end) => dispatch(handleMovePiece(piece, start, end)),
    handleDragPiece: (piece, start, dragAllowed) => dispatch(handleDragPiece(piece, start, dragAllowed)),
    setBoardState: state => dispatch(setBoardState(state))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
