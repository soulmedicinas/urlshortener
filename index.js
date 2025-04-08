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

// POST endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
 
// Validate URL
  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'invalid url' });
  }
  
  try {
    // Check if URL already exists
    let existingUrl = await Url.findOne({ original_url: url });
  
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }
    
  // Create new short URL
    const shortUrl = shortid.generate();
    const newUrl = new Url({
      original_url: url,
      short_url: shortUrl
    });

    await newUrl.save();

    res.json({
      original_url: url,
      short_url: shortUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
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

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port 3000`);
});
