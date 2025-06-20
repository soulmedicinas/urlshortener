// ES Module version
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'node:dns';
import validUrl from 'valid-url';
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

// Add this right after your imports for testing
console.log('Testing connection string...');
console.log('MONGO_URI from env:', process.env.MONGO_URI);
console.log('Fallback URI being used:', process.env.MONGO_URI || 'mongodb+srv://menali2:<dbpassword>@cluster0.oglmmzf.mongodb.net/');
  //.then(() => console.log('MongoDB connected successfully'))
 // .catch(err => {
   // console.error('MongoDB connection error:', err);
   // console.error('Error details:', err.message);
  //});

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://menali2:<dbpassword>@cluster0.oglmmzf.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Connection error details:', error);
    process.exit(1);
  }
};

connectDB();

(async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();

// URL Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number  // Changed to Number to match your example
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
  console.log('URL to validate:', url);
  
  // Check MongoDB connection status
  console.log('MongoDB connection state:', mongoose.connection.readyState);
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  
  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB not connected, returning error');
    return res.json({ error: 'database connection issue' });
  }
  
  // Validate URL format
  console.log('Checking if URL is valid web URI...');
  if (!validUrl.isWebUri(url)) {
    console.log('URL failed validUrl.isWebUri check');
    return res.json({ error: 'invalid url' });
  }
  console.log('URL passed validUrl.isWebUri check');

  try {
    // Check if URL already exists
    console.log('Checking if URL already exists in database...');
    let existingUrl = await Url.findOne({ original_url: url });
    if (existingUrl) {
      console.log('Found existing URL, returning it');
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }
    console.log('URL not found in database, proceeding with DNS check...');

    // DNS verification (with timeout and better error handling)
    const hostname = new URL(url).hostname;
    console.log('Extracted hostname:', hostname);
    console.log('Starting DNS lookup...');
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('DNS lookup timed out');
        reject(new Error('DNS lookup timeout'));
      }, 4000); // 4 second timeout
      
      dns.lookup(hostname, (err, address) => {
        clearTimeout(timeout);
        if (err) {
          console.log('DNS lookup failed for:', hostname, 'Error:', err.message);
          reject(new Error('invalid url'));
        } else {
          console.log('DNS lookup successful for:', hostname, 'Address:', address);
          resolve();
        }
      });
    });
    
    console.log('DNS check passed, creating new URL entry...');

    // Create new entry with numeric short URL
    const shortUrlNumber = await getNextShortUrl();
    console.log('Generated short URL number:', shortUrlNumber);
    
    const newUrl = new Url({
      original_url: url,
      short_url: shortUrlNumber
    });

    await newUrl.save();
    console.log('URL saved to database successfully');
    
    res.json({
      original_url: url,
      short_url: shortUrlNumber
    });
    
  } catch (err) {
    console.error('Error in POST /api/shorturl:', err.message);
    return res.json({ error: 'invalid url' });
  }
});

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
