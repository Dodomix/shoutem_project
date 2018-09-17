import React, { Component } from 'react';
// import Button from '@material-ui/core/Button';
// import AppBar from '@material-ui/core/AppBar';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import PropTypes from 'prop-types';
import './App.css';

import { connect } from 'react-redux';
import {
  assignIframe,
  setIframeLoaded,
  fetchState,
  postState
} from '../actions';
import {
  REGISTER,
  DATA_REQUEST,
  DATA_RESPONSE,
  REQUEST_SUCCEEDED,
  REQUEST_FAILED,
  UPDATE_STATE,
  STATE_UPDATED
} from '../responseTypeConstants';

class App extends Component {
  constructor(props) {
    super(props);

    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      const components = this.props.components;
      const component = components[Object.keys(components).find(key => components[key].origin === e.origin)];
      if (!component) {
        alert('Received message with unknown origin: ' + e.origin);
      } else if (component.iframe.contentWindow !== e.source) {
        alert('Received message with unknown source.');
      } else {
        if (e.data.type === DATA_REQUEST) {
          this.props.fetchState(e.origin, e.data.token).then(state => {
            this._postMessageToIframeComponent(component, {
              type: DATA_RESPONSE,
              state: state
            });
          });
        } else if (e.data.type === UPDATE_STATE) {
          this.props.postState({
            token: e.data.token,
            stateUpdate: e.data.stateUpdate,
            origin: e.origin
          }).then(() => {
            this._postMessageToIframeComponent(component, {
              type: REQUEST_SUCCEEDED
            });
            this._executeForEachComponent(this.props.components, component => this._postMessageToIframeComponent(component, {
              type: STATE_UPDATED
            }));
          }).catch(err => {
            this._postMessageToIframeComponent(component, {
              type: REQUEST_FAILED,
              reason: err.message
            });
          });
        } else {
          alert('Unrecognized message type: ' + e.data.type);
        }
      }
    });
  }

  componentDidMount() {
    this._executeForEachComponent(this.props.components, (component, key) => {
      component.iframe.addEventListener('load', () => {
        this._postMessageToIframeComponent(component, {
          type: REGISTER
        });
        this.props.setIframeLoaded(key, true);
      });
    });
  }

  _executeForEachComponent(components, action) {
    return Object.keys(components).forEach(key => action(components[key], key));
  }

  _postMessageToIframeComponent(component, message) {
    return component.iframe.contentWindow.postMessage(message, component.origin);
  }

  render() {
    const {components} = this.props;
    return (
      <div className="App">
        {this.props.apiOperationInProgress ? <div className="background">
          <div className="aligning-block"/><img id="loader" src="ajax-loader.gif" alt=""/>
        </div> : ''}
        <div>
          <iframe id="player1" ref={ this.props.assignIframe.bind(this, 'player1') } title="player1" src={ components.player1.origin }/>
          <iframe id="player2" ref={ this.props.assignIframe.bind(this, 'player2') } title="player2" src={ components.player2.origin }/>
        </div>
        <div className="error-message">{this.props.apiOperationFailed ? this.props.apiError.message : ''}</div>
      </div>
    );
  }
}

// App.propTypes = {
//   text: PropTypes.string.isRequired,
//   style: PropTypes.shape({
//     fontFamily: PropTypes.string,
//     fontSize: PropTypes.number,
//     color: PropTypes.string,
//     fontWeight: PropTypes.string,
//     fontStyle: PropTypes.string,
//     textDecoration: PropTypes.string
//   }).isRequired,
//   selectedIframe: PropTypes.string.isRequired,
//   iframeOrigin: PropTypes.string.isRequired,
//   iframeLoaded: PropTypes.bool.isRequired,
//   fetchInProgress: PropTypes.bool,
//   fetchFailed: PropTypes.bool,
//   postFailed: PropTypes.bool,
//   selectIframe: PropTypes.func.isRequired,
//   reset: PropTypes.func.isRequired,
//   setIframeLoaded: PropTypes.func.isRequired,
//   fetchText: PropTypes.func.isRequired,
//   postText: PropTypes.func.isRequired
// };

const mapStateToProps = state => {
  return {
    components: state.iframe.components,
    apiOperationInProgress: state.api.apiOperationInProgress,
    apiOperationFailed: state.api.apiOperationFailed,
    apiError: state.api.err
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignIframe: (iframeName, ref) => dispatch(assignIframe(iframeName, ref)),
    setIframeLoaded: (iframe, loaded) => dispatch(setIframeLoaded(iframe, loaded)),
    fetchState: (origin, token) => dispatch(fetchState(origin, token)),
    postState: parameters => dispatch(postState(parameters))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
