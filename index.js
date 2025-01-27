require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser
const dns = require('dns'); // Import dns module
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// New endpoint for URL shortening
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL using dns.lookup
  dns.lookup(originalUrl, (err) => {
    if (err) {
      return res.json({ error: 'Invalid URL' });
    }

    // If URL is valid, create short URL (implement your logic here)
    // For example:
    const shortUrl = generateShortUrl(originalUrl); // Replace with your logic

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Function to generate short URL (replace with your implementation)
function generateShortUrl(originalUrl) {
  // Implement your logic to generate a unique short URL 
  // (e.g., using a counter, hash function, or database)
  return 'http://localhost:3000/' + Math.random().toString(36).substring(2, 7); 
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
