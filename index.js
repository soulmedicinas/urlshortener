require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
const isUrl = require("is-url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }))

let counter = 1;
const orgUrl = {};

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function(req, res) {
  const url = req.body.url;
  if (!isUrl(url)) {
    return res.json({
      error: "invalid url"
    })
  }
  counter += 1;
  orgUrl[counter] = url;
  
  res.json({
    original_url: url,
    short_url: counter
  })
})

app.get("/api/shorturl/:id", function(req, res) {
  const id = req.params.id;
  const url = orgUrl[id];
  res.redirect(url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
