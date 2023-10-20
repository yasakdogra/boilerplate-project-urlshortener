require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('node:dns');
const dnsPromises = dns.promises;

// Basic Configuration
const port = process.env.PORT || 3000;

let bodyParser = require('body-parser');

const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlShortenerSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  }
});
urlShortenerSchema.plugin(AutoIncrement, { inc_field: 'id' });
const URLShortener = mongoose.model('URLShortener', urlShortenerSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', async function(req, res){
  let input = req.body.url;
  let url;
  try{
    url = new URL(input);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  try{
    await dnsPromises.lookup(url.host);
  } catch(err) {
    return res.json({ error: 'dns lookup failed' })
  }

  let existing = await URLShortener.findOne({ url: url.toString() }).exec();
  if(existing)
    return res.json({original_url : existing.url, short_url : existing.id});

  let data = await URLShortener.create({ url: url.toString() });
  if(data)
    return res.json({original_url : data.url, short_url : data.id});
  else
    return res.json({ error: 'database error' });
});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
