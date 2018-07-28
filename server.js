const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const pub = fs.readFileSync('public.pem');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Amz-Date, X-Amz-Security-Token');
  next();
});

let text = 'Hello world! :)';
let style = {
  'font-size': '20px',
  'font-style': 'normal',
  'color': 'black',
  'font-family': 'sans-serif',
};

app.get('/api/text', (req, res) => {
  res.send({
    text: text
  });
});

app.post('/api/text', (req, res) => {
  const body = req.body;
  const tokenData = jwt.verify(body.token, pub, { algorithm: 'RS512'});
  if (body.origin !== tokenData.origin) {
    res.status(403).send({
      message: 'Invalid origin'
    });
  } else if (tokenData.permissions.indexOf(body.action) === -1) {
    res.status(403).send({
      message: 'Action not permitted'
    });
  } else {
    if (body.action === 'MODIFY_CONTENT') {
     text = body.newContent;
    }
    if (body.action === 'MODIFY_STYLE') {
      style = {
        fontFamily: body.newStyle.font,
        fontSize: body.newStyle.fontSize,
        color: body.newStyle.color
      };
      if (body.newStyle.fontStyle.type === 'style') {
        style.fontStyle = body.newStyle.fontStyle.value;
      } else if (body.newStyle.fontStyle.type === 'decoration') {
        style.textDecoration = body.newStyle.fontStyle.value;
      } else if (body.newStyle.fontStyle.type === 'weight') {
        style.fontWeight = body.newStyle.fontStyle.value;
      }
    }
    res.send({
      text: text,
      style: style
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));