const express = require('express');
const cors = require('cors');
const router = require('./routes');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 4000;
const allowedOrigins = ['https://senso.senselive.io'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).sendFile(path.join(__dirname, 'public', 'access_denied.html'));
  }
  next();
});

app.use('/api', router);

app.get('/api/test', (req, res) => {
  console.log('Tried to acess the Nodejs')
  res.send('Response from Node.js server');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
