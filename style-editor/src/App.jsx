import React, { Component } from 'react';
import Picker from 'react-picker';
import 'react-picker/css/picker.css';
import ArrowDropDown from 'react-icons/lib/md/arrow-drop-down';
import './App.css';

class ContentEditor extends Component {
  state = {
    font: 'Arial',
    fontStyle: {
      type: 'style',
      value: 'italic'
    },
    fontSize: 15,
    color: 'black'
  };

  constructor(props) {
    super(props);
    window.addEventListener('message', e => {
      if (e.source === window) { // react messages
        return;
      }
      if (e.origin !== 'http://localhost:3000') {
        console.log('Invalid origin of message');
      } else {
        if (!this.state.sourceWindow && e.data.type === 'register') {
          this.setState({ sourceWindow: e.source })
        } else if (this.state.sourceWindow !== e.source) {
          console.log('Invalid source of message');
          return;
        }
        this.setState({
          text: e.data.text
        });
      }
    });
  }

  _modifyStyle = () => {
    const updatedStyle = {
      font: this.state.font,
      fontStyle: this.state.fontStyle,
      fontSize: this.state.fontSize,
      color: this.state.color
    };
    this._callApi('/api/token').then(body => {
      const token = body.token;
      this.state.sourceWindow.postMessage({
        token: token,
        action: 'MODIFY_STYLE',
        newStyle: updatedStyle
      }, 'http://localhost:3000');
    }).catch(err => {
      console.log(err);
    });
  };

  _callApi = async (path, options) => {
    const response = await fetch(`http://localhost:5001${path}`, options);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  _fontChanged = value => {
    this.setState({
      font: value
    });
  };

  _fontSizeChanged = e => {
    this.setState({
      fontSize: parseInt(e.target.value)
    });
  };

  _fontStyleChanged = value => {
    this.setState({
      fontStyle: value
    });
  };

  _colorChanged = value => {
    this.setState({
      color: value
    });
  };

  _handleFontClick = () => {
    this.refs.fontPicker.show()
  };

  _handleColorClick = () => {
    this.refs.colorPicker.show()
  };

  render() {
    return (
      <div className="StyleEditor">
        <div>Preview</div>
        <div>{this.state.text}</div>
        <div>Font</div>
        <Picker
          ref="fontPicker"
          value={this.state.font}
          options={['Arial', 'Times New Roman', 'Verdana']}
          onChange={this._fontChanged}
        >
          <div className="box" onClick={this._handleFontClick.bind(this)}>
            <label>{this.state.font}</label>
            <ArrowDropDown/>
          </div>
        </Picker>

        <div>Font style</div>
        <div onClick={this._fontStyleChanged.bind(this, {
          type: 'weight',
          value: 'bold'
        })}>B</div>
        <div onClick={this._fontStyleChanged.bind(this, {
          type: 'style',
          value: 'italic'
        })}>I</div>
        <div onClick={this._fontStyleChanged.bind(this, {
          type: 'decoration',
          value: 'underline'
        })}>U</div>

        <div>Font size</div>
        <input type="number" value={this.state.fontSize} min={5} max={30} onChange={this._fontSizeChanged.bind(this)}/>

        <div>Color</div>
        <Picker
          ref="colorPicker"
          value={this.state.color}
          options={['black', 'blue', 'red']}
          onChange={this._colorChanged}
        >
          <div className="box" onClick={this._handleColorClick.bind(this)}>
            <label>{this.state.color}</label>
            <ArrowDropDown/>
          </div>
        </Picker>
        <button onClick={this._modifyStyle}>Save</button>
      </div>
    );
  }
}

export default ContentEditor;
