import { connect } from 'react-redux';
import App from '../components/App';
import {
  selectIframe,
  setIframeLoaded,
  fetchText,
  postText
} from '../actions';

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
    setIframeLoaded: loaded => dispatch(setIframeLoaded(loaded)),
    fetchText: () => dispatch(fetchText()),
    postText: data => dispatch(postText(data))
  };
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;