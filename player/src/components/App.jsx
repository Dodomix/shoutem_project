import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import './App.css';
import Chess from 'react-chess';

import {connect} from 'react-redux';
import {
  setCommunicator,
  handleDragPiece,
  handleMovePiece,
  setBoardState
} from '../actions';

import CommunicatorChild from 'communicator/CommunicatorChild';

class App extends Component {
  componentDidMount() {
    const communicator = new CommunicatorChild();
    communicator.initialize(this.props.setBoardState);
    this.props.setCommunicator(communicator);
  }

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
    this.props.communicator.sendUpdateState({
      move: move
    });
  };

  render() {
    return (
      <div className="App">
        <Chess pieces={this.props.pieces} onMovePiece={this.props.handleMovePiece} onDragStart={this._handleDrag}/>
        <Button className="save-button" onClick={this._executeMove}>Save</Button>
      </div>
    );
  };
}

App.propTypes = {
  pieces: PropTypes.array.isRequired,
  move: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired
  }),
  piece: PropTypes.object,
  dragging: PropTypes.bool,
  communicator: PropTypes.any,
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
