const express = require('express');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs');
const bodyParser = require('body-parser');
const https = require('https');
const path = require('path');
require('./dash/alert');
require('./status');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/senso.senselive.io/privkey.pem', 'utf8');
const fullchain = fs.readFileSync('/etc/letsencrypt/live/senso.senselive.io/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: fullchain };

const app = express();
const port = 3000;

const allowedOrigins = ['https://senso.senselive.io', 'senso.senselive.io', 'https://trumen.senselive.io', 'trumen.senselive.io'];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 200,
// };
const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.host; // Use host if origin is undefined
  console.log(`Request received from Origin: ${origin}, Host: ${req.headers.host}`);

  // Allow requests with undefined origin or matching allowed origins
  if (!origin || allowedOrigins.includes(origin)) {
    next();
  } else {
    console.error(`Access Denied: Origin "${origin}" or Host "${req.headers.host}" is not allowed.`);
    return res.status(403).sendFile(path.join(__dirname, 'public', 'access_denied.html'));
  }
});

app.use('/api', router);

app.get('/api/test', (req, res) => {
  res.send('Response from Node.js server');
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`HTTPS server listening on port ${port}`);
});
