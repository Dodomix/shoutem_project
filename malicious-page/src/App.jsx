import React, { Component } from 'react';
import './App.css';

class ContentEditor extends Component {
  state = {
    text: '',
    sourceWindow: null
  };

  constructor(props) {
    super(props);
    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== 'http://localhost:3000') {
        console.log('Invalid origin of message');
      } else {
        if (!this.state.sourceWindow && e.data.type === 'register') {
          this.setState({ sourceWindow: e.source })
        } else if (this.state.sourceWindow !== e.source) {
          console.log('Invalid source of message');
          return;
        }
        this.setState({
          text: e.data.text
        });
      }
    });
  }

  _modifyText = () => {
    const updatedText = this.refs.updatedText.value;
    this._callApi('/api/token').then(body => {
      const token = body.token;
      this.state.sourceWindow.postMessage({
        token: token,
        action: 'MODIFY_CONTENT',
        newContent: updatedText
      }, 'http://localhost:3000');
    }).catch(err => {
      console.log(err);
    });
  };

  _callApi = async (path, options) => {
    const response = await fetch(`http://localhost:5001${path}`, options);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <div className="ContentEditor">
        <div>Preview</div>
        <div>{this.state.text}</div>
        <div>Edit text content</div>
        <textarea id="updatedText" ref="updatedText" placeholder="New text content"></textarea>
        <button onClick={this._modifyText}>Save</button>
      </div>
    );
  }
}

export default ContentEditor;
