const mysql = require('mysql2');
const cron = require('node-cron');
require('dotenv').config();

// Setup MySQL connection pool
const db = mysql.createPool({
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

db.on('connection', () => {
  console.log('Database connection established.');
});

db.on('error', (err) => {
  console.error('Database error:', err.message);
});

// Define the query for inserting data
const insertCleanData = async () => {
  const query = `
    INSERT INTO clean_data (DeviceUID, TimeStamp, Temperature, Humidity, flowRate, TemperatureR, TemperatureY, TemperatureB, Pressure, totalVolume)
    SELECT
      DeviceUID,
      FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (30 * 60)) * (30 * 60)) AS bucket_start_time,
      ROUND(AVG(Temperature), 1) AS Temperature,
      ROUND(AVG(Humidity), 1) AS Humidity,
      ROUND(AVG(flowRate), 1) AS flowRate,
      ROUND(AVG(TemperatureR), 1) AS TemperatureR,
      ROUND(AVG(TemperatureY), 1) AS TemperatureY,
      ROUND(AVG(TemperatureB), 1) AS TemperatureB,
      ROUND(AVG(Pressure), 1) AS Pressure,
      MAX(totalVolume) AS totalVolume
    FROM
      actual_data
    WHERE
      TimeStamp >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
    GROUP BY
      DeviceUID,
      bucket_start_time
    ORDER BY
      DeviceUID,
      bucket_start_time;
  `;

  try {
    const [result] = await db.promise().query(query);
    console.log(`[${new Date().toISOString()}] Data inserted successfully:`, result.affectedRows, 'rows affected.');
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error inserting data:`, error.message);
  }
};


cron.schedule('*/30 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] 30-minute cron job triggered.`);
    await insertCleanData();
});

console.log('Cron job initialized. Task will run every 10 seconds.');
