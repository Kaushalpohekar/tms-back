const util = require('util');
const db = require('./db');

// Promisify db.query
const queryAsync = util.promisify(db.query).bind(db);

async function testing() {
  // const query = `
  //   UPDATE tms.tms_devices AS d
  //   JOIN (
  //     SELECT DeviceUID
  //     FROM tms.tms_devices
  //   ) AS t
  //   ON d.DeviceUID = t.DeviceUID
  //   SET d.status = CASE
  //                    WHEN (SELECT MAX(ad.TimeStamp) FROM tms.actual_data ad WHERE ad.DeviceUID = d.DeviceUID) < NOW() - INTERVAL 5 MINUTE
  //                    THEN 'offline'
  //                    ELSE 'online'
  //                  END;
  // `;
  const query = `UPDATE tms.tms_devices AS d
                  JOIN (
                      -- Get latest timestamps for each DeviceUID in last 5 minutes
                      SELECT ad.DeviceUID, MAX(ad.TimeStamp) AS LatestTimeStamp
                      FROM tms.actual_data ad FORCE INDEX (idx_device_timestamp)  -- ✅ Force index for efficiency
                      WHERE ad.TimeStamp >= NOW() - INTERVAL 5 MINUTE  -- ✅ Partition pruning
                      GROUP BY ad.DeviceUID
                  ) AS latest ON d.DeviceUID = latest.DeviceUID
                  SET d.status = CASE 
                                  WHEN latest.LatestTimeStamp IS NULL THEN 'offline' 
                                  ELSE 'online' 
                                END;`;

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
