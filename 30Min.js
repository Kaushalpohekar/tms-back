const db = require('./db'); // Import the existing database connection
const cron = require('node-cron');

// Aggregation function
async function aggregateData() {
    const query = `
        START TRANSACTION;
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
        COMMIT;
    `;

    try {
        // Get a connection from the pool
        const connection = await db.promise();
        console.log(`[${new Date().toISOString()}] Starting data aggregation...`);

        // Execute the query
        const [results] = await connection.query(query);
        console.log(`[${new Date().toISOString()}] Data aggregation completed successfully.`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error executing query:`, error.message);
    }
}

// Function to handle unexpected errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
});

// Schedule the function to run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Scheduled task triggered.`);
    await aggregateData();
});

console.log(`[${new Date().toISOString()}] Cron job scheduled. Data aggregation will run every 30 minutes.`);
