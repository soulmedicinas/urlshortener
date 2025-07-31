import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import dns from 'dns';
import urlParser from 'url';
const app = express();

// Basic Configuration
const PORT = process.env.PORT || 5000;

app.use(cors());

// Middleware to parse URL-encoded bodies (from forms)
app.use(express.urlencoded({ extended: false }));

// Serve static files (CSS, client HTML, etc.)
app.use('/public', express.static(`${process.cwd()}/public`));

// In-memory database
let urlDatabase = {};
let counter = 1;

// Home page
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Example test endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint to shorten URL
app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;
  const parsedUrl = urlParser.parse(originalUrl);
  const hostname = parsedUrl.hostname;

  if (!hostname) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrl = counter++;
      urlDatabase[shortUrl] = originalUrl;
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:id', function (req, res) {
  const shortUrl = req.params.id;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
