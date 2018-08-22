import { connect } from 'react-redux';
import App from '../components/App';
import {
  setText,
  setStyle,
  setFontFamily,
  setFontStyle,
  setFontSize,
  setColor,
  setSourceWindow,
  fetchToken
} from '../actions';

const styleToTextStyle = style => Object.keys(style).reduce((acc, key) => {
  key === 'fontStyle' ?
    acc[style[key].type] = style[key].value :
    acc[key] = style[key];
  return acc;
}, {});

const textStyleToStyle = style => Object.keys(style).reduce((acc, key) => {
  key === 'textDecoration' || key === 'fontStyle' || key === 'fontWeight' ?
    acc['fontStyle'] = {
      value: style[key],
      type: key
    } : acc[key] = style[key];
  return acc;
}, {});


const mapStateToProps = state => {
  return {
    text: state.text.text,
    style: state.text.style,
    textStyle: styleToTextStyle(state.text.style),
    sourceWindow: state.comm.sourceWindow
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setText: text => dispatch(setText(text)),
    setStyle: style => dispatch(setStyle(textStyleToStyle(style))),
    setFontFamily: e => dispatch(setFontFamily(e.target.value)),
    setFontStyle: fontStyle => dispatch(setFontStyle(fontStyle)),
    setFontSize: e => dispatch(setFontSize(parseInt(e.target.value, 0) || 1)),
    setColor: e => dispatch(setColor(e.target.value)),
    setSourceWindow: sourceWindow => dispatch(setSourceWindow(sourceWindow)),
    fetchToken: () => dispatch(fetchToken())
  };
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;