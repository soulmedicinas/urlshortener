require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for URL mappings
const urlDatabase = {};
let urlCounter = 1;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the main HTML page
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Endpoint to shorten a URL
app.post('/api/shorturl', function(req, res) {
  const { url: longUrl } = req.body;
  
  if (!/^https?:\/\/(www\.)?.+/.test(longUrl)) {
    return res.json({ error: 'invalid url' });
  }
  
  const domain = longUrl.replace(/^https?:\/\//, '').split('/')[0];
  
  dns.lookup(domain, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = longUrl;
      res.json({ original_url: longUrl, short_url: shortUrl });
    }
  });
});

// Endpoint to redirect short URL to long URL
app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = req.params.shortUrl;
  const longUrl = urlDatabase[shortUrl];
  
  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.json({ error: 'No URL found for the given short URL' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
