const util = require('util');
const db = require('./db');

// Promisify db.query
const queryAsync = util.promisify(db.query).bind(db);

async function testing() {
  const query = `
    INSERT INTO tms_Day_Consumption (DeviceUID, TimeStamp, totalVolume)
    SELECT
      DeviceUID,
      DATE(TimeStamp) AS TimeStamp,
      COALESCE(ROUND(MAX(totalVolume) - MIN(totalVolume), 3), 0) as totalVolume
    FROM
      tms.actual_data
    WHERE
      DeviceUID IN (
          SELECT DeviceUID FROM tms.tms_devices WHERE DeviceType = 'ws' OR DeviceType = 'fs'
        ) AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 10 DAY)
    GROUP BY
      DeviceUID,
      DATE(TimeStamp)
    ORDER BY
      DeviceUID,
      TimeStamp
    ON DUPLICATE KEY UPDATE totalVolume = VALUES(totalVolume);`;

  try {
    const result = await queryAsync(query);
    console.log('Data Updated Successfully:', result);
  } catch (error) {
    console.error('Error While Updating Data:', error);
    // Assuming 'res' is passed as a parameter if you're handling HTTP response here
    // return res.status(500).json({ message: 'Internal server error' });
  }
}

// Call the function initially to start the process
testing();

// Schedule the testing function to run every minute
setInterval(testing, 60000); // 60000 milliseconds = 1 minute
