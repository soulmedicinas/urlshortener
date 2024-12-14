require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { shortId } = require('napi-nanoid');
const okUrl   = require("valid-url");
// const mongoDbURI = "mongodb+srv://aahborgesnogueira:dBJZnb3UNbMqcMho@cluster0.6qowl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongoDbURI = process.env.MONGO_URI || 'mongodb+srv://aahborgesnogueira:dBJZnb3UNbMqcMho@cluster0.6qowl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const port = process.env.PORT || 3000;
console.log( cors);
console.log( mongoDbURI);
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({'extended': false}));
app.use('/public', express.static(`$process.cwd()}/public`));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get( "/api/hello", function( req, res){
  res.json({ greeting: "hello API"});
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

mongoose.connect(mongoDbURI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS:5000 });
mongoose.connection.on('connected', () => console.log('connected'));
const Schema = mongoose.Schema;
const urlSchema = new Schema({original_url:String, short_url:String});
const URL = mongoose.model( "URL", urlSchema);
app.post("/api/shorturl", async function( req, res){
  const url = req.body.url;
  const urlCode = shortId.generate();

  if (!okUrl.isWebUri(url)){
    res.status(200).json({error:"invalid url"});
  }else{
    try{
      let findOne = await URL.findOne({ original_url: url});
      if (findOne){
        res.json({ original_url: findOne.original_url,
                   short_url:findOne.short_url});
      }else{
        findOne = new URL({original_url: url, short_url:urlCode});
        await findOne.save();
        res.json({ original_url: findOne.original_url,short_url:findOne.short_url});
      }
    } catch(err){
      res.status(500).json("server error");
    };
  };
});

app.get( "/api/shorturl/:shorturl", async function( req, res){
  try{
    const urlParms = await URL.findOne({ short_url: req.params.short_url});
    if( urlParms){
      return res.redirect(urlParms.original_url);
    }else{
      return res.status(404).json( "no URL found");
    };
  } catch(err){res.status(500).json("error");
  };
});