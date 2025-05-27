// ES Module version
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'node:dns';
import validUrl from 'valid-url';
import shortid from 'shortid';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Setup __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err.message));

mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err);
});

// URL Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);
const getNextShortUrl = async () => {
  const count = await Url.countDocuments();
  return count + 1;
};

// POST endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  console.log('Received body:', req.body);

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

   // DNS verification (with timeout and better error handling)
    const hostname = new URL(url).hostname;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('DNS lookup timeout'));
      }, 5000); // 5 second timeout
      
      dns.lookup(hostname, (err) => {
        clearTimeout(timeout);
        if (err) {
          console.log('DNS lookup failed for:', hostname, err.message);
          reject(new Error('invalid url'));
        } else {
          resolve();
        }
      });
    });
    
 // Create new entry with numeric short URL
    const shortUrlNumber = await getNextShortUrl();
    const newUrl = new Url({
      original_url: url,
      short_url: shortUrlNumber
    });

    await newUrl.save();
    
    res.json({
      original_url: url,
      short_url: shortUrlNumber
    });
    
  } catch (err) {
    return res.json({ error: 'invalid url' }); // Consistent error format
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
