const express = require('express'); 
const bodyParser = require('body-parser');
 const dns = require('dns'); 
 const urlparser = require('url');
  const app = express(); 
  app.use(bodyParser.urlencoded({ extended: false }));
   app.use(bodyParser.json()); 
   let urls = []; 
   let count = 0; 
   app.post('/api/shorturl', (req, res) => { 
    const { url } = req.body; 
    const parsedUrl = urlparser.parse(url);
     dns.lookup(parsedUrl.hostname, (err) => {
       if (err) {
         return res.json({ error: 'invalid url' });
         }
          count++;
           urls[count] = url; 
           res.json({ original_url: url, short_url: count });
           });
   })
   async (getUserInput) => {
    const url = getUserInput('url');
    const urlVariable = Date.now();
    const fullUrl = `${url}/?v=${urlVariable}`
    let shortenedUrlVariable;
    const postResponse = await fetch(url + '/api/shorturl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${fullUrl}`
    });
    if (postResponse.ok) {
      const { short_url } = await postResponse.json();
      shortenedUrlVariable = short_url;
    } else {
      throw new Error(`${postResponse.status} ${postResponse.statusText}`);
    }
    const getResponse = await fetch(
      url + '/api/shorturl/' + shortenedUrlVariable
    );
    if (getResponse) {
      const { redirected, url } = getResponse;
      assert.isTrue(redirected);
      assert.strictEqual(url,fullUrl);
    } else {
      throw new Error(`${getResponse.status} ${getResponse.statusText}`);
    }
  };
  async (getUserInput) => {
    const url = getUserInput('url');
    const res = await fetch(url + '/api/shorturl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=ftp:/john-doe.invalidTLD`
    });
    if (res.ok) {
      const { error } = await res.json();
      assert.isNotNull(error);
      assert.strictEqual(error.toLowerCase(), 'invalid url');
    } else {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  };
