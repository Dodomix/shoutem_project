import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './App.css';
import * as _ from 'lodash';
import Button from '@material-ui/core/Button';

import {connect} from 'react-redux';
import {
  assignIframe,
  setCommunicator,
  updateChessState,
  reset
} from '../actions';

import CommunicatorParent from 'communicator/CommunicatorParent';

export class App extends Component {
  componentDidMount() {
    const communicator = new CommunicatorParent({
      onInvalidOrigin: origin => alert('Received message with unknown origin: ' + origin),
      onInvalidSource: () => alert('Received message with unknown source.'),
      onUnknownMessage: type => alert('Unrecognized message type: ' + type),
      getReadableState: readPermissions => this._getReadableState(this.props.chessState, readPermissions),
      updateState: async (stateUpdate, writePermissions) => {
        if (!this._hasPermission(writePermissions, stateUpdate)) {
          throw new Error('Action not permitted');
        } else {
          await this.props.updateChessState(stateUpdate);
          if (!this.props.chessState.actionValid) {
            throw new Error('Action not valid');
          }
        }
      }
    });
    communicator.initialize(this.props.components);
    this.props.setCommunicator(communicator);
  }

  _getReadableState(state, permissions) {
    const readableState = {};
    _.forEach(permissions, permission => _.set(readableState, permission, _.get(state, permission)));
    return readableState;
  }

  _hasPermission(permissions, stateUpdate) {
    const permittedStateUpdate = {};
    permissions.filter(permission => _.get(stateUpdate, permission))
      .forEach(permission => _.set(permittedStateUpdate, permission, _.get(stateUpdate, permission)));
    return _.isEqual(stateUpdate, permittedStateUpdate);
  }

  async _reset() {
    await this.props.reset();
    this.props.communicator.notifyStateUpdated();
  }

  render() {
    const {components} = this.props;
    return (
      <div className="App">
        <Button className="reset-button" onClick={this._reset.bind(this)}>Reset</Button>
        <iframe
          id="player1" ref={this.props.assignIframe.bind(this, 'player1')} title="player1"
          src={components.player1.origin}/>
        <iframe
          id="player2" ref={this.props.assignIframe.bind(this, 'player2')} title="player2"
          src={components.player2.origin}/>
      </div>
    );
  }
}

App.propTypes = {
  components: PropTypes.object.isRequired,
  communicator: PropTypes.object,
  chessState: PropTypes.object.isRequired,
  assignIframe: PropTypes.func.isRequired,
  setCommunicator: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  updateChessState: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    components: state.iframe.components,
    communicator: state.iframe.communicator,
    chessState: state.chessState
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignIframe: (iframeName, ref) => dispatch(assignIframe(iframeName, ref)),
    setCommunicator: communicator => dispatch(setCommunicator(communicator)),
    updateChessState: stateUpdate => dispatch(updateChessState(stateUpdate)),
    reset: () => dispatch(reset())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
