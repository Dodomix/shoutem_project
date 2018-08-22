import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import './App.css';

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

  _isSelectedStyle = style => {
    return this.props.textStyle[style.type] === style.value;
  };

  render() {
    return (
      <div className="App">
        <div className="content">
          <div className="label">Preview</div>
          <div className="text" style={this.props.textStyle}>{this.props.text}</div>
        </div>
        <div className="content">
          <div className="label">Font</div>
          <div className="text">
            <FormControl className="form-control">
              <Select
                value={this.props.style.fontFamily}
                onChange={this.props.setFontFamily}
                inputProps={{
                  name: 'font',
                  id: 'font-select',
                }}
              >
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                <MenuItem value="Verdana">Verdana</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="content">
          <div className="label">Font Style</div>
          <div className="text">
            <div className="styles">
              <div className="style-pick" onClick={this.props.setFontStyle.bind(this, {
                type: 'fontWeight',
                value: 'bold'
              })} selected-style={this._isSelectedStyle({
                type: 'fontWeight',
                value: 'bold'
              }).toString()}>B</div>
              <div className="style-pick" onClick={this.props.setFontStyle.bind(this, {
                type: 'fontStyle',
                value: 'italic'
              })} selected-style={this._isSelectedStyle({
                type: 'fontStyle',
                value: 'italic'
              }).toString()}>I</div>
              <div className="style-pick" onClick={this.props.setFontStyle.bind(this, {
                type: 'textDecoration',
                value: 'underline'
              })} selected-style={this._isSelectedStyle({
                type: 'textDecoration',
                value: 'underline'
              }).toString()}>U</div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="label">Font Size</div>
          <div className="text">
            <Input className="size-input" type="number" value={this.props.style.fontSize} min={5} max={30} onChange={this.props.setFontSize}/>
          </div>
        </div>
        <div className="content">
          <div className="label">Color</div>
          <div className="text">
            <FormControl className="form-control">
              <Select
                value={this.props.style.color}
                onChange={this.props.setColor}
                inputProps={{
                  name: 'color',
                  id: 'color-select',
                }}
              >
                <MenuItem value="black">Black</MenuItem>
                <MenuItem value="blue">Blue</MenuItem>
                <MenuItem value="red">Red</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        <Button className="save-button" onClick={this._modifyStyle}>Save</Button>
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
