import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class ContentEditor extends Component {
  state = {
    response: ''
  };

  constructor(props) {
    super(props);
    window.addEventListener('message', e => {
      console.log(e);
    });
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('http://localhost:5001/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <div className="ContentEditor">
        <header className="ContentEditor-header">
          <img src={logo} className="ContentEditor-logo" alt="logo" />
          <h1 className="ContentEditor-title">Welcome to React</h1>
        </header>
        <p className="ContentEditor-intro">{this.state.response}</p>
      </div>
    );
  }
}

export default ContentEditor;
