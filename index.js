require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// Basic Configuration
const port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var urlHandler = require('./controllers/urlHandler.js');
app.post('/api/shorturl/new', urlHandler.addUrl);
app.get('/api/shorturl/:shurl', urlHandler.processShortUrl);
app.use(bodyParser.urlencoded({'extended': false}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
