import { connect } from 'react-redux';
import App from '../components/App';
import {
  setText,
  setSourceWindow,
  fetchToken
} from '../actions';

const mapStateToProps = state => {
  return {
    text: state.text.text,
    style: state.text.style,
    sourceWindow: state.comm.sourceWindow
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setText: text => dispatch(setText(text)),
    setSourceWindow: sourceWindow => dispatch(setSourceWindow(sourceWindow)),
    fetchToken: () => dispatch(fetchToken())
  };
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;