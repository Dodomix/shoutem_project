import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    text: 'Hello world! :)',
    selectedIframe: 'content-editor'
  };

  constructor(props) {
    super(props);
    this.contentEditor = React.createRef();
  }

  componentDidMount() {
    this.contentEditor.current.addEventListener('load', () => this.contentEditor.current.contentWindow.postMessage('message', 'http://localhost:3001'));
  }

  _getRenderSrc(selectedIframe) {
    console.log('here')
    if (selectedIframe === 'content-editor') {
      return 'http://localhost:3001/';
    } else if (selectedIframe === 'style-editor') {
      return 'http://localhost:3002/'
    } else {
      return 'http://localhost:3003/'
    }
  }

  render() {
    return (
      <div className="App">
        <div className="text">{this.state.text}</div>
        <button onClick={this.reset}>Reset</button>
        <div onClick={() => this.setState({selectedIframe: 'content-editor'})}>Content Editor</div>
        <div onClick={() => this.setState({selectedIframe: 'style-editor'})}>Style Editor</div>
        <div onClick={() => this.setState({selectedIframe: 'malicious-page'})}>Malicious Page</div>
        <div>
          <iframe ref={this.contentEditor} title="app" src={this._getRenderSrc(this.state.selectedIframe)} />
        </div>
      </div>
    );
  }
}

export default App;
