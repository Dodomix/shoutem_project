import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import './App.css';
import Chess from 'react-chess';

import {connect} from 'react-redux';
import {
  handleDragPiece,
  handleMovePiece,
  setBoardState,
  setCommunicator,
  toggleSentToken,
  toggleAllowMoveOtherPlayer
} from '../actions';

import CommunicatorChild from 'communicator/CommunicatorChild';

class App extends Component {
  componentDidMount() {
    const communicator = new CommunicatorChild('http://localhost:5001', 'http://localhost:3000', {
      onInvalidOrigin: origin => alert('Component received message with invalid origin: ' + origin),
      onInvalidSource: () => alert('Component received message with invalid source.'),
      onReceiveState: this.props.setBoardState,
      onFetchTokenFailed: message => alert(message),
      onUnknownMessage: type => alert('Unrecognized message type: ' + type),
      onRequestFailed: message => alert(message),
      onTokenExpired: () => alert('Token expired, retrying')
    });
    communicator.initialize();
    this.props.setCommunicator(communicator);
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
    if (this.props.sendOtherToken) {
      this.props.communicator.token =
        'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDIiLCJwZXJtaXNzaW9ucyI6' +
        'eyJyZWFkIjpbImJvYXJkIiwiY3VycmVudFBsYXllciIsImdhbWVTdGF0dXMiLCJpc0JsYWNrUGxheWVyIl0sIndyaXRlIjpbIm1vdm' +
        'UuYmxhY2siXX0sImlhdCI6MTUzOTAxNzgxMn0.Kgibjes1Yktk8zYcQDWnaFjSh294CJFq87MmXDqCZO_qe7vjgiSZMOtrZqW-lsRQ' +
        'sxmCUz_ZWsFjBYVe1lhPG1X6Yhi005FzSubIpzbSPyeRfkwqQ0UEY6LibfJ_iJIQhau99b1MPYqklDvkiqDjF2rYuI2oFHYqMgrDsO-' +
        'V6wCaPo5k-eVmWSKWFQVzhjraxLmRG3SGmY6dDWDJUB3AuMXJEv_EeFUnBS8kcivD9Twr7-wZU01us5LRkXKA3t7Qf8WFufZ4VKZ5-_' +
        'fkm4nY4vVcUqW6-Q2pNORaakITmybWpwwTFrYB-B7adCLTu7o8b-Zr7gv0WMvdZ89MpaxJD_HSMD9zHXYhmLbF6Y1VO6fjigT9Ux-oVK' +
        'ONIZ_OVtUBzFuSeVRyPwharVoVgCQl4CoLAN8zg0WnierVN_Olr7br1KvGsIrVynUYD2aofRapd-6amxYrOB1leBIIfpPLvbmmAS-9Ji' +
        'VmJ6ybOqoQmo9Nxz9il1h5CbrIXKt5S9i_0nLTFCM4UeZDhUIqBHOKMts1Y1lRC4wLrTHV6gJzWe1TQLn8cMRq8eScJSIi7NQbtBTOs7' +
        'U1CZnNggaOwvyNsQTktDfnKVQe4U8iU_uLQ4muKnhxu4ImhCh1o57mHUE4pExww3A-u3CB3MqZz2LBglX4Yw8RxZsN8Q0DYTWwQhY';
    }
    this.props.communicator.sendUpdateState({
      move: move
    });
    if (this.props.sendOtherToken) { // clear token so it's refetched
      this.props.communicator.token = null;
    }
  }

  _getPlayer() {
    if (this.props.isWhitePlayer) {
      return 'white';
    } else if (this.props.isBlackPlayer) {
      return 'black';
    } else {
      throw Error('Unknown player type');
    }
  }

  _draggingValidPiece(piece) {
    if (this.props.allowMoveOtherPlayer) {
      return true;
    }
    if (this._getPlayer() === 'white') {
      return piece.name === piece.name.toUpperCase();
    } else {
      return piece.name !== piece.name.toUpperCase();
    }
  }

  _getPieceColor(piece){
    return piece && piece.name === piece.name.toUpperCase() ? 'white' : 'black';
  }

  _sendFakeMessageType() {
    this.props.communicator._postMessageToParent({
      type: 'FAKE_TYPE'
    });
  }

  render() {
    return (
      <div className="App">
        <h2 className="game-status">{this.props.gameStatus}</h2>
        {
          (this.props.isWhitePlayer || this.props.isBlackPlayer) &&
          <h3 className="title">{this._getPlayer() === 'white' ? 'Player 1 (white)' : 'Player 2 (black)'}</h3>
        }
        <h3 className="title">Turn: {this.props.currentPlayer}</h3>
        <Chess pieces={this.props.pieces} onMovePiece={this.props.handleMovePiece} onDragStart={this._handleDrag.bind(this)}/>
        <Button onClick={this._executeMove.bind(this)}>Submit</Button>

        {
          this.props.isWhitePlayer &&
          <div>
            <div>
              <FormControlLabel control={
                <Checkbox onChange={this.props.toggleAllowMoveOtherPlayer} color="primary"/>
              } label="Allow move other player"/>
            </div>
            <div>
              <FormControlLabel control={
                <Checkbox onChange={this.props.toggleSentToken} color="primary"/>
              } label="Send other token" />
            </div>
            <div>
              <Button onClick={this._sendFakeMessageType.bind(this)}>Send fake message type</Button>
            </div>
          </div>
        }
      </div>
    );
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
  sendOtherToken: PropTypes.bool.isRequired,
  allowMoveOtherPlayer: PropTypes.bool.isRequired,
  currentPlayer: PropTypes.string.isRequired,
  handleMovePiece: PropTypes.func.isRequired,
  handleDragPiece: PropTypes.func.isRequired,
  setBoardState: PropTypes.func.isRequired,
  setCommunicator: PropTypes.func.isRequired,
  toggleSentToken: PropTypes.func.isRequired,
  toggleAllowMoveOtherPlayer: PropTypes.func.isRequired
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
    sendOtherToken: state.board.sendOtherToken,
    allowMoveOtherPlayer: state.board.allowMoveOtherPlayer,
    communicator: state.comm.communicator
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleMovePiece: (piece, start, end) => dispatch(handleMovePiece(piece, start, end)),
    handleDragPiece: (piece, start, dragAllowed) => dispatch(handleDragPiece(piece, start, dragAllowed)),
    setBoardState: state => dispatch(setBoardState(state)),
    setCommunicator: communicator => dispatch(setCommunicator(communicator)),
    toggleSentToken: () => dispatch(toggleSentToken()),
    toggleAllowMoveOtherPlayer: () => dispatch(toggleAllowMoveOtherPlayer())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
