// const express = require('express');
// const cors = require('cors');
// const router = require('./routes');
// const bodyParser = require('body-parser');
// const path = require('path');

// const app = express();
// const port = 4000;
// const allowedOrigins = ['https://senso.senselive.io'];

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

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(bodyParser.json());

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (!origin || !allowedOrigins.includes(origin)) {
//     return res.status(403).sendFile(path.join(__dirname, 'public', 'access_denied.html'));
//   }
//   next();
// });

// app.use('/api', router);

// app.get('/api/test', (req, res) => {
//   console.log('Tried to acess the Nodejs')
//   res.send('Response from Node.js server');
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


const express = require('express');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const path = require('path');

const app = express();
const port = 4000;

// CORS Configuration
const allowedOrigins = ['https://elkem.senselive.in', 'http://localhost:4000']; // Update with your actual allowed origins


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

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api', router);
app.get('/api/test', (req, res) => {
  console.log('Received GET request to /elkem/test');
  res.send('Response from Node.js server');
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
