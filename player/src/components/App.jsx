import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import './App.css';
import Chess from 'react-chess';

import { connect } from 'react-redux';
import {
  setSourceWindow,
  fetchToken
} from '../actions';

class App extends Component {
  constructor(props) {
    super(props);
    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== 'http://localhost:3000') {
        console.log('Invalid origin of message');
      } else {
        if (!this.props.sourceWindow && e.data.type === 'register') {
          this.props.setSourceWindow(e.source);
        } else if (this.props.sourceWindow !== e.source) {
          console.log('Invalid source of message');
          return;
        }
      }
    });
  }

  _modifyText = () => {
    // this.props.fetchToken().then(token => this.props.sourceWindow.postMessage({
    //   token: token,
    //   action: 'MODIFY_CONTENT',
    //   newContent: this.refs.updatedText.value
    // }, 'http://localhost:3000'));
  };

  render() {
    return (
      <div className="App">
        <Chess pieces={this.props.pieces} onMovePiece={this.props.handleMovePiece}/>
        <Button className="save-button" onClick={this._modifyText}>Save</Button>
      </div>
    );
  }
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
    pieces: Chess.getDefaultLineup(),
    sourceWindow: state.comm.sourceWindow
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSourceWindow: sourceWindow => dispatch(setSourceWindow(sourceWindow)),
    fetchToken: () => dispatch(fetchToken()),
    handleMovePiece: (d1, d2, d3) => console.log(d1, d2, d3)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
