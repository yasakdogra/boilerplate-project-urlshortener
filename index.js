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

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
