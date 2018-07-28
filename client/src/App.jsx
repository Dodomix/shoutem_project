import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    text: '',
    style: {},
    selectedIframe: 'content-editor',
    iframeData: {
      'content-editor': {
        origin: 'http://localhost:3001'
      },
      'style-editor': {
        origin: 'http://localhost:3002'
      },
      'malicious-page': {
        origin: 'http://localhost:3003'
      }
    },
    iframeLoaded: false
  };

  constructor(props) {
    super(props);
    this.iframeComponent = React.createRef();
    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== this._getCurrentComponentData().origin) {
        console.log('Invalid origin of message');
      } else if(e.source !== this.iframeComponent.current.contentWindow) {
        console.log('Invalid source of message');
      } else {
        const data = e.data;
        data.origin = e.origin;
        this._callApi('/api/text', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(body => {
          this.setState({
            text: body.text,
            style: body.style
          });
          if (this.state.iframeLoaded) {
            this._postMessageToCurrentIframeComponent({
              type: 'text-update',
              text: this.state.text
            });
          }
        }).catch(err => {
          console.log(err);
        });
      }
    });
  }

  componentDidMount() {
    this.iframeComponent.current.addEventListener('load',
      () => {
        this.setState({iframeLoaded: true});
        this._postMessageToCurrentIframeComponent({
          type: 'register',
          text: this.state.text
        })
      });
    this._callApi('/api/text').then(body => {
      this.setState({
        text: body.text
      });
      if (this.state.iframeLoaded) {
        this._postMessageToCurrentIframeComponent({
          type: 'text-update',
          text: this.state.text
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }

  _callApi = async (path, options) => {
    const response = await fetch(`http://localhost:5000${path}`, options);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  _postMessageToCurrentIframeComponent(message) {
    this.iframeComponent.current.contentWindow.postMessage(message, this._getCurrentComponentData().origin)
  }

  _getRenderSrc(selectedIframe) {
    return this.state.iframeData[selectedIframe].origin;
  }

  _getCurrentComponentData() {
    return this.state.iframeData[this.state.selectedIframe];
  }

  render() {
    return (
      <div className="App">
        <div className="text" style={this.state.style}>{this.state.text}</div>
        <button onClick={this.reset}>Reset</button>
        <div onClick={() => this.setState({selectedIframe: 'content-editor', iframeLoaded: false})}>Content Editor</div>
        <div onClick={() => this.setState({selectedIframe: 'style-editor', iframeLoaded: false})}>Style Editor</div>
        <div onClick={() => this.setState({selectedIframe: 'malicious-page', iframeLoaded: false})}>Malicious Page</div>
        <div>
          <iframe id="contentIframe" ref={this.iframeComponent} title="app" src={this._getRenderSrc(this.state.selectedIframe)} />
        </div>
      </div>
    );
  }
}

export default App;
