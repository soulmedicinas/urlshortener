require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.DB_URL);
const db = client.db( "urlshortner");
const urls = db.collection( "urls");
const dns = require( "dns");
const urlparser = require( "url");
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
/*var bodyParser = require('body-parser');
var urlHandler = require('./controllers/urlHandler.js');
app.post('/api/shorturl/new', urlHandler.addUrl);
app.get('/api/shorturl/:shurl', urlHandler.processShortUrl);
app.use(bodyParser.urlencoded({'extended': false}));*/
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(url).hostname,
  async(err, address) =>{
    if(!address){
      res.json({ error: "Invalid URL"});
    } else{
        const urlCount = await urls.countDocuments({});
        const urlDoc = { url, short_url: urlCount };
        const result = await urls.insertOne(urlDoc);
        res.json( {original_url: url, short_url: urlCont});
    };

  });

});

app.get( "api/shorturl/:short_url", async (req,res) =>{
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({short_url: shorturl});
  res.redirect(urlDoc.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
