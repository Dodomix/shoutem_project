import { connect } from 'react-redux';
import App from '../components/App';
import {
  selectIframe,
  setIframeLoaded,
  textRequest,
  receivedText,
  receivedFetchTextError,
  receivedPostTextError
} from '../actions';

const callApi = async (path, options) => {
  const response = await fetch(`http://localhost:5000${path}`, options);
  const body = await response.json();

  if (response.status !== 200) throw Error(body.message);

  return body;
};

const mapStateToProps = state => {
  return {
    text: state.text.text,
    style: state.text.style,
    fetchInProgress: state.text.fetchInProgress,
    fetchFailed: state.text.fetchFailed,
    postFailed: state.text.postFailed,
    selectedIframe: state.iframe.selectedIframe,
    iframeOrigin: state.iframe.iframeData[state.iframe.selectedIframe].origin,
    iframeLoaded: state.iframe.iframeLoaded
  };
};

const mapDispatchToProps = dispatch => {
  return {
    selectIframe: selectedIframe => dispatch(selectIframe(selectedIframe)),
    reset: () => {},
    setIframeLoaded: loaded => {
      dispatch(setIframeLoaded(loaded));
    },
    fetchText: () => {
      dispatch(textRequest());
      return callApi('/api/text').then(body => {
        dispatch(receivedText(body.text, body.style));
      }).catch(err => {
        console.log(err);
        dispatch(receivedFetchTextError(err));
      });
    },
    postText: data => {
      dispatch(textRequest());
      return callApi('/api/text', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(body => {
        dispatch(receivedText(body.text, body.style));
      }).catch(err => {
        console.log(err);
        dispatch(receivedPostTextError(err));
      });
    }
  };
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;