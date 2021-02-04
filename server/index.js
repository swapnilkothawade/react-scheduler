const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 5000;

const app = express();

let schedule = [];

app.use(bodyParser.json());

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/schedule', (req, res) => {
  return res.send(schedule);
});

app.post('/schedule', (req, res) => {
  schedule = req.body;
  return res.send(schedule);
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../client/build/', 'index.html'));
});

app.listen(PORT, function () {
  console.error(`Node listening on port ${PORT}`);
});