import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import Picker from 'react-picker';
import 'react-picker/css/picker.css';
import ArrowDropDown from 'react-icons/lib/md/arrow-drop-down';

class App extends Component {
  constructor(props) {
    super(props);
    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== 'http://localhost:3000') {
        console.log('Invalid origin of message');
      } else {
        if (!this.props.sourceWindow && e.data.type === 'register') {
          this.props.setSourceWindow(e.source);
        } else if (this.props.sourceWindow !== e.source) {
          console.log('Invalid source of message');
          return;
        }
        this.props.setText(e.data.text);
        this.props.setStyle(e.data.style);
      }
    });
  }

  _modifyStyle = () => {
    this.props.fetchToken().then(token => this.props.sourceWindow.postMessage({
      token: token,
      action: 'MODIFY_STYLE',
      newStyle: this.props.style
    }, 'http://localhost:3000'));
  };

  _handleFontClick = () => {
    this.refs.fontPicker.show()
  };

  _handleColorClick = () => {
    this.refs.colorPicker.show()
  };

  render() {
    return (
      <div className="App">
        <div>Preview</div>
        <div style={this.props.textStyle}>{this.props.text}</div>
        <div>Font</div>
        <Picker
          ref="fontPicker"
          value={this.props.style.fontFamily}
          options={['Arial', 'Times New Roman', 'Verdana']}
          onChange={this.props.setFontFamily}
        >
          <div className="box" onClick={this._handleFontClick.bind(this)}>
            <label>{this.props.style.fontFamily}</label>
            <ArrowDropDown/>
          </div>
        </Picker>

        <div>Font style</div>
        <div onClick={this.props.setFontStyle.bind(this, {
          type: 'fontWeight',
          value: 'bold'
        })}>B</div>
        <div onClick={this.props.setFontStyle.bind(this, {
          type: 'fontStyle',
          value: 'italic'
        })}>I</div>
        <div onClick={this.props.setFontStyle.bind(this, {
          type: 'textDecoration',
          value: 'underline'
        })}>U</div>

        <div>Font size</div>
        <input type="number" value={this.props.style.fontSize} min={5} max={30} onChange={this.props.setFontSize}/>

        <div>Color</div>
        <Picker
          ref="colorPicker"
          value={this.props.style.color}
          options={['black', 'blue', 'red']}
          onChange={this.props.setColor}
        >
          <div className="box" onClick={this._handleColorClick.bind(this)}>
            <label>{this.props.style.color}</label>
            <ArrowDropDown/>
          </div>
        </Picker>
        <button onClick={this._modifyStyle}>Save</button>
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
    fontStyle: PropTypes.shape({
      type: PropTypes.string,
      value: PropTypes.string
    })
  }).isRequired,
  textStyle: PropTypes.shape({
    fontFamily: PropTypes.string,
    fontSize: PropTypes.number,
    color: PropTypes.string,
    fontWeight: PropTypes.string,
    fontStyle: PropTypes.string,
    textDecoration: PropTypes.string
  }).isRequired,
  sourceWindow: PropTypes.any,
  setText: PropTypes.func.isRequired,
  setSourceWindow: PropTypes.func.isRequired,
  setStyle: PropTypes.func.isRequired,
  setFontFamily: PropTypes.func.isRequired,
  setFontStyle: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setColor: PropTypes.func.isRequired,
  fetchToken: PropTypes.func.isRequired
};

export default App;
