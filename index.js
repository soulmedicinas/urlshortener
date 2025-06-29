require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once("open", function () {
  console.log("Connection successful!");
});

// URL Schema
const urlSchema = new mongoose.Schema({
  id: Number,
  url: String
});

const urlModel = mongoose.model('url', urlSchema)

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// URL shorter
app.post("/api/shorturl", (req, res) => {
  let url = req.body.url;


 // Search for '://', store protocol and hostname+path
  const protocolRegExp = /^https?:\/\/(.*)/i;

  // Search for patterns like xxxx.xxxx.xxxx etc.
  const hostnameRegExp = /^([a-z0-9\-_]+\.)+[a-z0-9\-_]+/i;

  // "www.example.com/test/" and "www.example.com/test" are the same URL
  if (url.match(/\/$/i))
    url = url.slice(0, -1);

  const protocolMatch = url.match(protocolRegExp);
  if (!protocolMatch) {
    return res.json({ "error": "Invalid URL" });
  }

  // Remove the protocol temporarily  for DNS lookup
  const hostAndQuery = protocolMatch[1];

  // Here we have a URL w/out protocol
  // DNS lookup: validate hostname
  const hostnameMatch = hostAndQuery.match(hostnameRegExp);
  if (hostnameMatch) {
    // the URL has a valid www.whaterver.com[/something-optional] format
    dns.lookup(hostnameMatch[0], (err) => {
      if (err) {
        // no DNS match, invalid Hostname, the URL won't be stored
        res.json({ "error": "Invalid Hostname" });
      } else {
        // URL is OK, check if it's already stored
        urlModel
          .find().exec().then(data => {
            new urlModel({
              id: data.length + 1,
              url: req.body.url
            }).save().then(() => {
              res.json({
                original_url: req.body.url,
                short_url: data.length + 1
              });
            }).catch(err => {
              res.json(err);
            });
          });
      }
    });
  } else {
    // the URL has not a www.whatever.com format
    res.json({ "error": "Invalid URL" });
  };
});

//
app.get("/api/shorturl/:id", (req, res) => {

  if (!parseInt(req.params.id, 10)) {
    // The short URL identifier is not a number
    res.json({ "error": "Wrong format" });
    return;
  }

// GET endpoint to redirect short URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const shortUrlParam = parseInt(req.params.short_url);
    
    // Validate that short_url is a number
    if (isNaN(shortUrlParam)) {
      return res.status(404).json({ error: 'No URL found' });
    }
    
    const url = await Url.findOne({ short_url: shortUrlParam });
    
    if (url) {
      return res.redirect(url.original_url);
    } else {
      return res.status(404).json({ error: 'No URL found' });
    }
  } catch (err) {
    console.error('Error in GET /api/shorturl:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Basic routes
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, '0.0.0.0', function() {
  console.log(`Server running on port ${port}`);
});
