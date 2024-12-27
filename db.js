const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createPool({
  connectionLimit: 20,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  connectTimeout: 10000,
});

connection.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
    return;
  }
  console.log('Connected to database with ID:', connection.threadId);
  connection.release();
});

module.exports = connection;
