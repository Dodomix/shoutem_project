import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
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
              text: this.props.text,
              style: this.props.style
            });
          }
        });
      }
    });
  }

  componentDidMount() {
    this.iframeComponent.current.addEventListener('load', () => {
      this._postMessageToCurrentIframeComponent({
        type: 'register',
        text: this.props.text,
        style: this.props.style
      });
      this.props.setIframeLoaded(true);
    });

    this.props.fetchText().then(() => {
      if (this.props.iframeLoaded) {
        this._postMessageToCurrentIframeComponent({
          type: 'text-update',
          text: this.props.text,
          style: this.props.style
        });
      }
    });
  }

  _postMessageToCurrentIframeComponent(message) {
    this.iframeComponent.current.contentWindow.postMessage(message, this.props.iframeOrigin)
  }

  selectIframe(e, value) {
    return this.props.selectIframe(value);
  }

  render() {
    const {text, style, iframeOrigin, selectedIframe, reset} = this.props;
    return (
      <div className="App">
        <Button className="reset-button" onClick={reset}>Reset</Button>
        <div className="text" style={style}>{text}</div>
        <AppBar className="tabs" position="static" color="default">
          <Tabs
            value={selectedIframe}
            onChange={this.selectIframe.bind(this)}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="auto"
          >
            <Tab value="content-editor" label="Content Editor" />
            <Tab value="style-editor" label="Style Editor" />
            <Tab value="malicious-page" label="Malicious Page" />
          </Tabs>
        </AppBar>
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
