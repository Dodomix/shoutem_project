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
    res.send({
      text: text
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));