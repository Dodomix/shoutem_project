import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './App.css';

import {connect} from 'react-redux';
import {
  assignIframe,
  setCommunicator
} from '../actions';

import CommunicatorParent from 'communicator/CommunicatorParent';

class App extends Component {
  componentDidMount() {
    const communicator = new CommunicatorParent();
    communicator.initialize(this.props.components);
    this.props.setCommunicator(communicator);
  }

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
  assignIframe: PropTypes.func.isRequired,
  setCommunicator: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    components: state.iframe.components,
    communicator: state.iframe.communicator
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignIframe: (iframeName, ref) => dispatch(assignIframe(iframeName, ref)),
    setCommunicator: communicator => dispatch(setCommunicator(communicator))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
