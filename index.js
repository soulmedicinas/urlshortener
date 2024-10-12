require('dotenv').config({path: './sample.env' });
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const shortid = require('shortid')
mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

let Struct
const Schema = mongoose.Schema
const StructSchema = new Schema({
  original_url : {required: true, type: String},
  short_url: {type: String, required: true}
})
Struct = mongoose.model("Struct", StructSchema)
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next();
})
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post("/api/shorturl", async (req, res) => {
  const originalurl= req.body.url
  try {
    if(!originalurl.startsWith('http')) return res.json({ error: 'invalid url' })
    let existingURL = await Struct.findOne({original_url: originalurl})
    if (existingURL) return res.json({
      original_url:existingURL.original_url, 
      short_url: existingURL.short_url})
    const shortcode = shortid.generate()
    const newStruct = new Struct({
      original_url: originalurl,
      short_url: shortcode
    })
    await newStruct.save()
    res.json({
      original_url: originalurl,
      short_url: shortcode
    })
  } catch( err) {
    console.error(err)
    res.status(500).json({ error: 'server error'})
  }
})
app
  .get('/api/shorturl', (req,res,next)=>{
    if (req.query.short_url) {
      req.params.short_url = req.query.short_url
      next()
    } else {
      return res.json({error: "no code provided"})
    }
  })
  .get('/api/shorturl/:short_url', async (req,res)=>{
  const shortcode = req.params.short_url
  try {
    const URL = await Struct.findOne({short_url: shortcode})
    if (URL) res.redirect(URL.original_url)
    else return res.status(404).json( { error: 'No short URL found for the given input'})
  } catch(err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});