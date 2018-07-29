import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

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
        this.props.setText(e.data.text);
      }
    });
  }

  _modifyText = () => {
    this.props.fetchToken().then(token => this.props.sourceWindow.postMessage({
      token: token,
      action: 'MODIFY_CONTENT',
      newContent: this.refs.updatedText.value
    }, 'http://localhost:3000'));
  };

  render() {
    return (
      <div className="App">
        <div>Preview</div>
        <div>{this.props.text}</div>
        <div>Edit text content</div>
        <textarea id="updatedText" ref="updatedText" placeholder="New text content"/>
        <button onClick={this._modifyText}>Save</button>
      </div>
    );
  }
}

App.propTypes = {
  text: PropTypes.string.isRequired,
  sourceWindow: PropTypes.any,
  setText: PropTypes.func.isRequired,
  setSourceWindow: PropTypes.func.isRequired,
  fetchToken: PropTypes.func.isRequired
};

export default App;
