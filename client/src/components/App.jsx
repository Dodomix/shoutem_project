import React, { Component } from 'react';
// import Button from '@material-ui/core/Button';
// import AppBar from '@material-ui/core/AppBar';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import PropTypes from 'prop-types';
import './App.css';

import { connect } from 'react-redux';
import {
  setIframeLoaded,
  fetchState,
  postState
} from '../actions';

class App extends Component {
  constructor(props) {
    super(props);
    this._executeForEachComponent(component => component.iframe = React.createRef()); // TODO

    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      const components = this.props.components;
      const component = components[Object.keys(components).find(key => components[key].origin === e.origin)];
      if (!component) {
        console.log('Invalid origin of message');
      } else if (components.iframe.current.contentWindow !== e.source) {
        console.log('Invalid source of message');
      } else {
        if (e.message.type === 'data-request') {
          this.props.fetchState(e.origin, e.message.token).then(state => {
            this._postMessageToIframeComponent(component, {
              type: 'data-response',
              state: state
            });
          });
        } else if (e.message.type === 'state-update') {
          this.props.postState({
            token: e.message.token,
            stateUpdate: e.message.stateUpdate,
            origin: e.origin
          }).then(() => {
            this._postMessageToIframeComponent(component, {
              type: 'request-succeeded'
            });
            this._executeForEachComponent(component => this._postMessageToIframeComponent(component, {
              type: 'state-updated'
            }));
          }).catch(err => {
            this._postMessageToIframeComponent(component, {
              type: 'request-failed',
              reason: err
            });
          });
        } else {
          console.log('Unrecognized request');
        }
      }
    });
  }

  componentDidMount() {
    this._executeForEachComponent((component, key) => {
      component.iframe.current.addEventListener('load', () => {
        this._postMessageToIframeComponent(component, {
          type: 'register'
        });
        this.props.setIframeLoaded(key, true);
      });
    });
  }

  _executeForEachComponent(action) {
    const components = this.props.components;
    Object.keys(components).forEach(key => action(components[key], key));
  }

  _postMessageToIframeComponent(component, message) {
    component.iframe.current.contentWindow.postMessage(message, component.origin);
  }

  render() {
    const {components} = this.props;
    return (
      <div className="App">
        <div>
          <iframe id="player1" ref={ components.player1.iframe } title="player1" src={ components.player1.origin }/>
          <iframe id="player2" ref={ components.player2.iframe } title="player2" src={ components.player2.origin }/>
        </div>
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
    components: state.iframe.components
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setIframeLoaded: (iframe, loaded) => dispatch(setIframeLoaded(iframe, loaded)),
    fetchState: parameters => dispatch(fetchState(parameters)),
    postState: parameters => dispatch(postState(parameters))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
