const express = require('express');
const cors = require('cors');
const router = require('./routes');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.get('/api/test', (req, res) => {
  console.log('Received GET request to /api/test');
  res.send('Response from Node.js server');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
