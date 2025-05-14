require('dotenv').config();
console.log('MongoDB URI:', process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');
const dns = require('dns'); 
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err.message));

mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err);
});

// URL Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  // Basic URL format check
  if (!url || !/^https?:\/\/(www\.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(\/.*)?$/i.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Skip DNS lookup for local testing (remove later)
    const hostname = new URL(url).hostname;
    if (!hostname.includes('localhost')) { // Skip DNS for local URLs
      await new Promise((resolve, reject) => {
        dns.lookup(hostname, (err) => {
          if (err) reject(new Error('invalid url'));
          else resolve();
        });
      });
    }

    // Existing URL check and save logic...
    let existingUrl = await Url.findOne({ original_url: url });
    if (existingUrl) return res.json(existingUrl);

    const shortUrl = shortid.generate();
    const newUrl = new Url({ original_url: url, short_url: shortUrl });
    await newUrl.save();
    
    return res.json({ original_url: url, short_url: shortUrl });

  } catch (err) {
    console.error('Validation error:', err);
    return res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect short URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const url = await Url.findOne({ short_url: req.params.short_url });
    
    if (url) {
      return res.redirect(url.original_url);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// basic routes
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, '0.0.0.0', function() {
  console.log(`Server running on port ${port}`);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
