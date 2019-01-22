import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import './App.css';
import Chess from 'react-chess';

import {connect} from 'react-redux';
import {
  handleDragPiece,
  handleMovePiece,
  setBoardState,
  setCommunicator
} from '../actions';

class App extends Component {
  componentDidMount() {
    if (!WebSocket) {
      return;
    }

    const ws = new WebSocket(`ws://${window.location.hostname}:8000`);

    ws.onopen = e => console.log('Connected!');
    ws.onmessage = e => {
      const parsedData = JSON.parse(e.data);
      if (parsedData.error) {
        alert(parsedData.error);
      } else {
        this.props.setBoardState(parsedData);
      }
    };
    ws.onerror = () => alert('Could not connect');

    this.props.setCommunicator(ws);
  }

  _handleDrag(piece, start) {
    if (this.props.gameStatus) { // game is over
      return false;
    }
    const dragging = this.props.dragging;
    const savedPiece = this.props.piece;
    const dragAllowed = (dragging || // if already dragging, the old piece was returned to its position
      savedPiece === null || // first move
      savedPiece.notation === piece.notation) && // moving the same piece
      this._draggingValidPiece(piece);
    this.props.handleDragPiece(piece, start, dragAllowed);
    return dragAllowed;
  }

  _executeMove() {
    const move = {};
    move[this._getPieceColor(this.props.piece)] = this.props.move;
    this.props.communicator.send(JSON.stringify({
      move: move
    }));
  }

  _getPlayer() {
    if (this.props.isWhitePlayer) {
      return 'white';
    } else if (this.props.isBlackPlayer) {
      return 'black';
    } else {
      return null;
    }
  }

  _draggingValidPiece(piece) {
    if (this.props.isWhitePlayer) {
      return piece.name === piece.name.toUpperCase();
    } else if (this.props.isBlackPlayer) {
      return piece.name !== piece.name.toUpperCase();
    } else {
      return false;
    }
  }

  _getPieceColor(piece){
    return piece && piece.name === piece.name.toUpperCase() ? 'white' : 'black';
  }

  render() {
    // WebSocket = null;
    let browserInvalid = false;
    if (!WebSocket) {
      browserInvalid = true;
      alert('This browser does not support WebSocket spec.');
    }

    return <div className="App">
      {
        !browserInvalid &&
        <div>
          <h2 className="game-status">{this.props.gameStatus}</h2>
          {
            (this.props.isWhitePlayer || this.props.isBlackPlayer) &&
            <h3 className="title">{this._getPlayer() === 'white' ? 'Player 1 (white)' : 'Player 2 (black)'}</h3>
          }
          {
            (!this.props.isWhitePlayer && !this.props.isBlackPlayer) &&
            <h3 className="title">Spectator</h3>
          }
          <h3 className="title">Turn: {this.props.currentPlayer}</h3>
          <Chess pieces={this.props.pieces} onMovePiece={this.props.handleMovePiece} onDragStart={this._handleDrag.bind(this)}/>
          <Button onClick={this._executeMove.bind(this)}>Submit</Button>
        </div>
      }
      {
        browserInvalid &&
        <div>This browser does not support the WebSocket spec.</div>
      }
    </div>;
  }
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
  isWhitePlayer: PropTypes.bool,
  isBlackPlayer: PropTypes.bool,
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
    isWhitePlayer: state.board.isWhitePlayer,
    isBlackPlayer: state.board.isBlackPlayer,
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
