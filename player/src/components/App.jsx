import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import './App.css';
import Chess from 'react-chess';

import {connect} from 'react-redux';
import {handleDragPiece, handleMovePiece, setBoardState, setCommunicator} from '../actions';

import CommunicatorChild from 'communicator/CommunicatorChild';

class App extends Component {
  componentDidMount() {
    const communicator = new CommunicatorChild({
      onInvalidOrigin: origin => alert('Component received message with invalid origin: ' + origin),
      onInvalidSource: () => alert('Component received message with invalid source.'),
      onReceiveState: this.props.setBoardState,
      onFetchTokenFailed: message => alert(message),
      onUnknownMessage: type => alert('Unrecognized message type: ' + type),
      onRequestFailed: message => alert(message)
    });
    communicator.initialize();
    this.props.setCommunicator(communicator);
  }

  _handleDrag = (piece, start) => {
    if (this.props.gameStatus) { // game is over
      return false;
    }
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
    this.props.communicator.sendUpdateState({
      move: move
    });
  };

  render() {
    return (
      <div className="App">
        <h2 className="game-status">{this.props.gameStatus}</h2>
        <h3 className="title">{this.props.whitePlayerTitle}{this.props.blackPlayerTitle}</h3>
        <h3 className="title">Turn: {this.props.currentPlayer}</h3>
        <Chess pieces={this.props.pieces} onMovePiece={this.props.handleMovePiece} onDragStart={this._handleDrag}/>
        <Button className="save-button" onClick={this._executeMove}>Submit</Button>
      </div>
    );
  };
}

App.propTypes = {
  pieces: PropTypes.array.isRequired,
  move: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string
  }),
  piece: PropTypes.object,
  dragging: PropTypes.bool,
  communicator: PropTypes.any,
  gameStatus: PropTypes.string,
  whitePlayerTitle: PropTypes.string,
  blackPlayerTitle: PropTypes.string,
  currentPlayer: PropTypes.string.isRequired,
  handleMovePiece: PropTypes.func.isRequired,
  handleDragPiece: PropTypes.func.isRequired,
  setBoardState: PropTypes.func.isRequired,
  setCommunicator: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    pieces: state.board.pieces,
    move: state.board.move,
    piece: state.board.piece,
    dragging: state.board.dragging,
    currentPlayer: state.board.currentPlayer,
    gameStatus: state.board.gameStatus,
    whitePlayerTitle: state.board.whitePlayerTitle,
    blackPlayerTitle: state.board.blackPlayerTitle,
    communicator: state.comm.communicator
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleMovePiece: (piece, start, end) => dispatch(handleMovePiece(piece, start, end)),
    handleDragPiece: (piece, start, dragAllowed) => dispatch(handleDragPiece(piece, start, dragAllowed)),
    setBoardState: state => dispatch(setBoardState(state)),
    setCommunicator: communicator => dispatch(setCommunicator(communicator))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
