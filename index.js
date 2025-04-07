require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// URL Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

// Validate URL
  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'invalid url' });
  }
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
