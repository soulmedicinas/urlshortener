require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo=  require('mongodb');
const mongoose= require('mongoose');
const cors = require("cors");
const util = require("util");
const dns = require("dns");
const lookupPromise = util.promisify(dns.lookup);

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


const schema = mongoose.schema;
const shortUrlSchema = new Schema( {Url:{type:string,  required: true}, index: {type: Number, required: true}});
const shortURL= mongoose.model('shortURLSchema', shortUrlSchema);

const counterSchema = new Schema({count: {type: Number, required: true, default:1}});
const counterSchema = mongoose.model('Counter', counterSchema);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post("/api/shorturl/new", (req,res)=>{
  const url = req.body.url;

  const protocolMatch= domainPath.match(/^([\w\-]+\.)+[\w\-]+/i);

if(!protocolMatch){
   return res.json({ error: "invalid URL" });
}
  lookupPromise(domainMatch[0]);
  .then(async () => {
      const short = new ShortURL({
        url: url,
        index: (await ShortURL.countDocuments({}).exec()) + 1
      });
  try{
    await short.save();
    return res.json(' original_url: url,
          short_url: short.index
        });
  } catch {
        return res.json({ error: "database save error" });
}
}).catch(()=>{
      return res.json({ error: "invalid domain" });
    });
})
app.get("/api/shorturl/:short_url", (req, res)=>{
  ShortURL.findOne({ index: parseInt(req.params.index)},(err,data)=>{
    if (err) {
      return res.json({ error: "database error" });
    } else if (data) {
      return res.redirect(data.url);
    } else {
      return res.json({ error: "no such short URL" });
    }
  });
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
