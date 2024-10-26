const express = require('express');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs');
const bodyParser = require('body-parser');
const https = require('https');
const path = require('path');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/senso.senselive.in/privkey.pem', 'utf8');
const fullchain = fs.readFileSync('/etc/letsencrypt/live/senso.senselive.in/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: fullchain };

const app = express();

const port = 3000;

const path = require('path');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api', router);
app.get('/api/test', (req, res) => {
  console.log('Received GET request to /api/example');
  res.send('Response from Node.js server');
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).sendFile(path.join(__dirname, 'public', 'access_denied.html'));
  }
  next();
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000, () => {
  console.log(`HTTPS server listening on port ${port}`);
});
