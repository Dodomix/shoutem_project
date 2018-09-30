import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './App.css';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';

import {connect} from 'react-redux';
import {
  assignIframe,
  setCommunicator,
  updateChessState
} from '../actions';

import CommunicatorParent from 'communicator/CommunicatorParent';

class App extends Component {
  async componentDidMount() {
    const pub = await (await fetch('../public.pem')).text();
    const communicator = new CommunicatorParent({
      onInvalidOrigin: origin => alert('Received message with unknown origin: ' + origin),
      onInvalidSource: () => alert('Received message with unknown source.'),
      onUnknownMessage: type => alert('Unrecognized message type: ' + type),
      getReadableState: (origin, token) => {
        const tokenData = jwt.verify(token, pub, {algorithm: 'RS512'});
        if (origin !== tokenData.origin) {
          throw new Error('Invalid origin');
        } else {
          return this._getReadableState(this.props.chessState, tokenData.permissions);
        }
      },
      updateState: async stateUpdate => {
        const tokenData = jwt.verify(stateUpdate.token, pub, {algorithm: 'RS512'});
        if (stateUpdate.origin !== tokenData.origin) {
          throw new Error('Invalid origin');
        } else if (!this._hasPermission(tokenData.permissions, stateUpdate.stateUpdate)) {
          throw new Error('Action not permitted');
        } else {
          await this.props.updateChessState(stateUpdate.stateUpdate);
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
    _.forEach(permissions.read, permission => _.set(readableState, permission, _.get(state, permission)));
    return readableState;
  };

  _hasPermission(permissions, stateUpdate) {
    const permittedStateUpdate = {};
    permissions.write
      .filter(permission => _.get(stateUpdate, permission))
      .forEach(permission => _.set(permittedStateUpdate, permission, _.get(stateUpdate, permission)));
    return _.isEqual(stateUpdate, permittedStateUpdate);
  };

  render() {
    const {components} = this.props;
    return (
      <div className="App">
        <iframe id="player1" ref={this.props.assignIframe.bind(this, 'player1')} title="player1"
                src={components.player1.origin}/>
        <iframe id="player2" ref={this.props.assignIframe.bind(this, 'player2')} title="player2"
                src={components.player2.origin}/>
      </div>
    );
  }
}

App.propTypes = {
  components: PropTypes.object.isRequired,
  comunicator: PropTypes.any,
  chessState: PropTypes.object.isRequired,
  assignIframe: PropTypes.func.isRequired,
  setCommunicator: PropTypes.func.isRequired
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
    updateChessState: stateUpdate => dispatch(updateChessState(stateUpdate))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
