import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.iframeComponent = React.createRef();

    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== this.props.iframeOrigin) {
        console.log('Invalid origin of message');
      } else if(e.source !== this.iframeComponent.current.contentWindow) {
        console.log('Invalid source of message');
      } else {
        const data = e.data;
        data.origin = e.origin;
        this.props.postText(data).then(() => {
          if (this.props.iframeLoaded) {
            this._postMessageToCurrentIframeComponent({
              type: 'text-update',
              text: this.props.text
            });
          }
        });
      }
    });
  }

  componentDidMount() {
    this.iframeComponent.current.addEventListener('load', () => {
      this.props.setIframeLoaded(true);
      this._postMessageToCurrentIframeComponent({
        type: 'register',
        text: this.props.text
      })
    });

    this.props.fetchText().then(() => {
      if (this.props.iframeLoaded) {
        this._postMessageToCurrentIframeComponent({
          type: 'text-update',
          text: this.props.text
        });
      }
    });
  }

  _postMessageToCurrentIframeComponent(message) {
    this.iframeComponent.current.contentWindow.postMessage(message, this.props.iframeOrigin)
  }

  render() {
    const {text, style, iframeOrigin, selectIframe, reset} = this.props;
    return (
      <div className="App">
        <div className="text" style={style}>{text}</div>
        <button onClick={reset}>Reset</button>
        <div onClick={selectIframe.bind(this, 'content-editor')}>Content Editor</div>
        <div onClick={selectIframe.bind(this, 'style-editor')}>Style Editor</div>
        <div onClick={selectIframe.bind(this, 'malicious-page')}>Malicious Page</div>
        <div>
          <iframe id="contentIframe" ref={this.iframeComponent} title="app" src={iframeOrigin}/>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.shape({
    fontFamily: PropTypes.string,
    fontSize: PropTypes.number,
    color: PropTypes.string,
    fontWeight: PropTypes.string,
    fontStyle: PropTypes.string,
    textDecoration: PropTypes.string
  }).isRequired,
  selectedIframe: PropTypes.string.isRequired,
  iframeOrigin: PropTypes.string.isRequired,
  iframeLoaded: PropTypes.bool.isRequired,
  fetchInProgress: PropTypes.bool,
  fetchFailed: PropTypes.bool,
  postFailed: PropTypes.bool,
  selectIframe: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setIframeLoaded: PropTypes.func.isRequired,
  fetchText: PropTypes.func.isRequired,
  postText: PropTypes.func.isRequired
};

export default App;
