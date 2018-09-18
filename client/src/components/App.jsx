import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './App.css';

import {connect} from 'react-redux';
import {
  assignIframe,
  setCommunicator
} from '../actions';

import CommunicatorParent from 'communicator/communicator-parent';

class App extends Component {
  componentDidMount() {
    setCommunicator(new CommunicatorParent(this.props.components));
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
  assignIframe: PropTypes.func.isRequired,
  setCommunicator: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    components: state.iframe.components
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
