const bcrypt = require('bcrypt');
const db = require('../db');
const moment = require('moment');

function userDevices(req, res) {
  const companyEmail = req.params.companyEmail;
  const userCheckQuery = 'SELECT * FROM tms_users WHERE CompanyEmail = ?';

  db.query(userCheckQuery, [companyEmail], (error, userCheckResult) => {
    if (error) {
      console.error('Error during user check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (userCheckResult.length === 0) {

        return res.status(400).json({ message: 'User not found!' });
      }

      const devicesQuery = 'SELECT * from tms_devices WHERE CompanyEmail = ?';

      db.query(devicesQuery, [companyEmail], (error, devices) => {
        if (error) {
          console.error('Error fetching devices:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ devices });
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function editDevice(req, res) {
  const deviceId = req.params.deviceId;
  const { DeviceLocation, DeviceName } = req.body;
  const deviceCheckQuery = 'SELECT * FROM tms_devices WHERE DeviceUID = ?';

  db.query(deviceCheckQuery, [deviceId], (error, deivceCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (deivceCheckResult.length === 0) {
        return res.status(400).json({ message: 'Device not found!' });
      }

      const devicesQuery = 'Update tms_devices SET DeviceLocation = ?, DeviceName = ? WHERE DeviceUID = ?';

      db.query(devicesQuery, [DeviceLocation, DeviceName, deviceId], (error, devices) => {
        if (error) {
          console.error('Error fetching devices:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Device Updated SuccessFully' });
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function companyDetails(req, res) {
  const UserId = req.params.UserId;
  const { Designation, ContactNo, Location } = req.body;
  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserId = ?';

  db.query(userCheckQuery, [UserId], (error, useridCheckResult) => {
    if (error) {
      console.error('Error during UserId check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (useridCheckResult.length === 0) {
        return res.status(400).json({ message: 'User not found!' });
      }

      const userQuery = 'Update tms_users SET Designation=?, ContactNo=?, Location=? WHERE UserId=?';

      db.query(userQuery, [Designation, ContactNo, Location, UserId], (error, details) => {
        if (error) {
          console.error('Error fetching company details:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Company details Updated SuccessFully' });
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function personalDetails(req, res) {
  const UserId = req.params.UserId;
  const { FirstName, LastName } = req.body;
  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserId = ?';

  db.query(userCheckQuery, [UserId], (error, useridCheckResult) => {
    if (error) {
      console.error('Error during UserId check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (useridCheckResult.length === 0) {
        return res.status(400).json({ message: 'User not found!' });
      }

      const userdetailQuery = 'Update tms_users SET FirstName=?, LastName=? WHERE UserId=?';

      db.query(userdetailQuery, [FirstName, LastName, UserId], (error, details) => {
        if (error) {
          console.error('Error fetching devices:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Personal details Updated SuccessFully' });
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function updatePassword(req, res) {
  const UserId = req.params.UserId;
  const { Password } = req.body;

  // Check if the user exists in the database
  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserId = ?';
  db.query(userCheckQuery, [UserId], (error, useridCheckResult) => {
    try {
      if (error) {
        console.error('Error during UserId check:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (useridCheckResult.length === 0) {
        return res.status(400).json({ message: 'User not found!' });
      }

      // Hash the new password
      const hashedPassword = bcrypt.hashSync(Password, 10);

      // Update the user's password in the database
      const updatePasswordQuery = 'UPDATE tms_users SET Password = ? WHERE UserId = ?';
      db.query(updatePasswordQuery, [hashedPassword, UserId], (error, result) => {
        if (error) {
          console.error('Error updating password:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Password updated successfully' });
      });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function fetchDeviceTrigger(req, res) {
  const deviceId = req.params.deviceId;
  const deviceTriggerQuery = 'select * from tms_trigger where DeviceUID = ?';
  try {
    db.query(deviceTriggerQuery, [deviceId], (error, devicetriggerkResult) => {
      if (error) {
        console.error('Error during device check:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(200).json(devicetriggerkResult);
    });
  } catch (error) {
    console.error('Error in device check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function fetchAllDeviceTrigger(req, res) {
  const CompanyEmail = req.params.CompanyEmail;
  const deviceTriggerQuery = 'select * from tms_trigger where CompanyEmail = ?';

  try {
    db.query(deviceTriggerQuery, [CompanyEmail], (error, triggers) => {
      if (error) {
        console.error('Error during device check:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(200).json({ triggers });
    });
  } catch (error) {
    console.error('Error in device check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function editDeviceTrigger(req, res) {
  const deviceId = req.params.deviceId;
  const { TriggerValue, CompanyEmail } = req.body;
  const deviceCheckQuery = 'SELECT * FROM tms_trigger WHERE DeviceUID = ?';

  db.query(deviceCheckQuery, [deviceId], (error, deviceCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (deviceCheckResult.length === 0) {
        const insertTriggerQuery = 'INSERT INTO tms_trigger (DeviceUID, TriggerValue, CompanyEmail) VALUES (?,?,?)';

        db.query(insertTriggerQuery, [deviceId, TriggerValue, CompanyEmail], (error, insertResult) => {
          if (error) {
            console.error('Error while inserting device:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          return res.json({ message: 'Device added successfully!' });
        });
      } else {
        const updateDeviceTriggerQuery = 'UPDATE tms_trigger SET TriggerValue = ?, CompanyEmail = ? WHERE DeviceUID = ?';

        db.query(updateDeviceTriggerQuery, [TriggerValue, CompanyEmail, deviceId], (error, updateResult) => {
          if (error) {
            console.error('Error updating device trigger:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          return res.json({ message: 'Device updated successfully' });
        });
      }
    } catch (error) {
      console.error('Error in device check:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function getDataByTimeInterval(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const timeInterval = req.query.interval;
    if (!timeInterval) {
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    let sql;
    switch (timeInterval) {
      case '1hour':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 60) * 60) AS bucket_start_time,
          IFNULL(ROUND(AVG(Temperature), 1), 0) AS Temperature,
          IFNULL(ROUND(AVG(Humidity), 1), 0) AS Humidity,
          IFNULL(ROUND(AVG(flowRate), 1), 0) AS flowRate,
          IFNULL(ROUND(AVG(TemperatureR), 1), 0) AS TemperatureR,
          IFNULL(ROUND(AVG(TemperatureB), 1), 0) AS TemperatureB,
          IFNULL(ROUND(AVG(TemperatureY), 1), 0) AS TemperatureY,
          IFNULL(ROUND(AVG(Pressure), 1), 0) AS Pressure
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        GROUP BY
          DeviceUID,
          bucket_start_time
        ORDER BY
          DeviceUID,
          bucket_start_time;`;
        break;

      case '12hour':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (2 * 60)) * (2 * 60)) AS bucket_start_time,
          IFNULL(ROUND(AVG(Temperature), 1), 0) AS Temperature,
          IFNULL(ROUND(AVG(Humidity), 1), 0) AS Humidity,
          IFNULL(ROUND(AVG(flowRate), 1), 0) AS flowRate,
          IFNULL(ROUND(AVG(TemperatureR), 1), 0) AS TemperatureR,
          IFNULL(ROUND(AVG(TemperatureB), 1), 0) AS TemperatureB,
          IFNULL(ROUND(AVG(TemperatureY), 1), 0) AS TemperatureY,
          IFNULL(ROUND(AVG(Pressure), 1), 0) AS Pressure
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
        GROUP BY
          DeviceUID,
          bucket_start_time
        ORDER BY
          DeviceUID,
          bucket_start_time;`;
        break;

      case '1day':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (2 * 60)) * (2 * 60)) AS bucket_start_time,
          IFNULL(ROUND(AVG(Temperature), 1), 0) AS Temperature,
          IFNULL(ROUND(AVG(Humidity), 1), 0) AS Humidity,
          IFNULL(ROUND(AVG(flowRate), 1), 0) AS flowRate,
          IFNULL(ROUND(AVG(TemperatureR), 1), 0) AS TemperatureR,
          IFNULL(ROUND(AVG(TemperatureB), 1), 0) AS TemperatureB,
          IFNULL(ROUND(AVG(TemperatureY), 1), 0) AS TemperatureY,
          IFNULL(ROUND(AVG(Pressure), 1), 0) AS Pressure
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        GROUP BY
          DeviceUID,
          bucket_start_time
        ORDER BY
          DeviceUID,
          bucket_start_time;`;
        break;

      case '7day':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (10 * 60)) * (10 * 60)) AS bucket_start_time,
          IFNULL(ROUND(AVG(Temperature), 1), 0) AS Temperature,
          IFNULL(ROUND(AVG(Humidity), 1), 0) AS Humidity,
          IFNULL(ROUND(AVG(flowRate), 1), 0) AS flowRate,
          IFNULL(ROUND(AVG(TemperatureR), 1), 0) AS TemperatureR,
          IFNULL(ROUND(AVG(TemperatureB), 1), 0) AS TemperatureB,
          IFNULL(ROUND(AVG(TemperatureY), 1), 0) AS TemperatureY,
          IFNULL(ROUND(AVG(Pressure), 1), 0) AS Pressure
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY
          DeviceUID,
          bucket_start_time
        ORDER BY
          DeviceUID,
          bucket_start_time;`;
        break;

      case '30day':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (30 * 60)) * (30 * 60)) AS bucket_start_time,
          IFNULL(ROUND(AVG(Temperature), 1), 0) AS Temperature,
          IFNULL(ROUND(AVG(Humidity), 1), 0) AS Humidity,
          IFNULL(ROUND(AVG(flowRate), 1), 0) AS flowRate,
          IFNULL(ROUND(AVG(TemperatureR), 1), 0) AS TemperatureR,
          IFNULL(ROUND(AVG(TemperatureB), 1), 0) AS TemperatureB,
          IFNULL(ROUND(AVG(TemperatureY), 1), 0) AS TemperatureY,
          IFNULL(ROUND(AVG(Pressure), 1), 0) AS Pressure
        FROM
          clean_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY
          DeviceUID,
          bucket_start_time
        ORDER BY
          DeviceUID,
          bucket_start_time;`;
        break;

      case '6month':
        sql = `
          SELECT
            DeviceUID,
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (60 * 60)) * (60 * 60)) AS bucket_start_time,
            IFNULL(ROUND(AVG(Temperature), 1), 0) AS Temperature,
            IFNULL(ROUND(AVG(Humidity), 1), 0) AS Humidity,
            IFNULL(ROUND(AVG(flowRate), 1), 0) AS flowRate,
            IFNULL(ROUND(AVG(TemperatureR), 1), 0) AS TemperatureR,
            IFNULL(ROUND(AVG(TemperatureB), 1), 0) AS TemperatureB,
            IFNULL(ROUND(AVG(TemperatureY), 1), 0) AS TemperatureY,
            IFNULL(ROUND(AVG(Pressure), 1), 0) AS Pressure
          FROM
            clean_data
          WHERE
            DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          GROUP BY
            DeviceUID,
            bucket_start_time
          ORDER BY
            DeviceUID,
            bucket_start_time;`;
        break;

      case '12month':
        sql = `
          SELECT
            DeviceUID,
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (120 * 60)) * (120 * 60)) AS bucket_start_time,
            IFNULL(ROUND(AVG(Temperature), 1), 0) AS Temperature,
            IFNULL(ROUND(AVG(Humidity), 1), 0) AS Humidity,
            IFNULL(ROUND(AVG(flowRate), 1), 0) AS flowRate,
            IFNULL(ROUND(AVG(TemperatureR), 1), 0) AS TemperatureR,
            IFNULL(ROUND(AVG(TemperatureB), 1), 0) AS TemperatureB,
            IFNULL(ROUND(AVG(TemperatureY), 1), 0) AS TemperatureY,
            IFNULL(ROUND(AVG(Pressure), 1), 0) AS Pressure
          FROM
            clean_data
          WHERE
            DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY
            DeviceUID,
            bucket_start_time
          ORDER BY
            DeviceUID,
            bucket_start_time;`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid time interval' });
    }

    db.query(sql, [deviceId], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ data: results });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


function getDataByTimeIntervalStatus(req, res) {
  const deviceId = req.params.deviceId;
  const timeInterval = req.query.interval;
  if (!timeInterval) {
    return res.status(400).json({ message: 'Invalid time interval' });
  }

  let duration;
  switch (timeInterval) {
    case '30sec':
      duration = 'INTERVAL 30 SECOND';
      break;
    case '1min':
      duration = 'INTERVAL 1 MINUTE';
      break;
    case '2min':
      duration = 'INTERVAL 2 MINUTE';
      break;
    case '5min':
      duration = 'INTERVAL 5 MINUTE';
      break;
    case '10min':
      duration = 'INTERVAL 10 MINUTE';
      break;
    case '30min':
      duration = 'INTERVAL 30 MINUTE';
      break;
    case '1hour':
      duration = 'INTERVAL 1 HOUR';
      break;
    case '2hour':
      duration = 'INTERVAL 2 HOUR';
      break;
    case '10hour':
      duration = 'INTERVAL 10 HOUR';
      break;
    case '12hour':
      duration = 'INTERVAL 12 HOUR';
      break;
    case '1day':
      duration = 'INTERVAL 1 DAY';
      break;
    case '7day':
      duration = 'INTERVAL 7 DAY';
      break;
    case '30day':
      duration = 'INTERVAL 30 DAY';
      break;
    default:
      return res.status(400).json({ message: 'Invalid time interval' });
  }

  const sql = `SELECT Status, COUNT(*) as count FROM tms_trigger_logs WHERE DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), ${duration}) GROUP BY Status`;
  db.query(sql, [deviceId], (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      // Calculate total count
      const totalCount = results.reduce((total, entry) => total + entry.count, 0);

      // Calculate percentage for each status
      const dataWithPercentage = results.map((entry) => ({
        status: entry.Status,
        count: entry.count,
        percentage: (entry.count / totalCount) * 100
      }));

      res.json({ dataStatus: dataWithPercentage });
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function avg_interval(req, res) {
  const id = req.params.id;
  const timeInterval = req.params.interval;
  if (!timeInterval) {
    return res.status(400).json({ message: 'Invalid time interval' });
  }
  let duration;
  switch (timeInterval) {

    case '1hour':
      duration = 'INTERVAL 1 HOUR';
      break;
    case '12hour':
      duration = 'INTERVAL 12 HOUR';
      break;
    case '24hour':
      duration = 'INTERVAL 24 HOUR';
      break;
    case '1day':
      duration = 'INTERVAL 1 DAY';
      break;
    case '7day':
      duration = 'INTERVAL 7 DAY';
      break;
    case '30day':
      duration = 'INTERVAL 30 DAY';
      break;
    default:
      res.status(400).json({ message: 'Invalid time interval' });
  }
  const fetchbucketavgquery = `SELECT
    CONCAT(SUBSTR(DATE_FORMAT(TimeStamp, '%y-%m-%d %H.%i'), 1, 13), '0.00') AS bucket_start,
    CONCAT(SUBSTR(DATE_FORMAT(TimeStamp, '%y-%m-%d %H.%i'), 1, 13), '9.59') AS bucket_end,
    COUNT(*) AS count_bucket,
    AVG(TemperatureR) as avg_temp_R,
    AVG(TemperatureY) as avg_temp_Y,
    AVG(TemperatureB) as avg_temp_B
  FROM
    actual_data
  WHERE
    DeviceUID=? AND TimeStamp >= DATE_SUB(NOW(), ${duration})
  GROUP BY
    bucket_start,bucket_end
  ORDER BY
    bucket_start`;

  try {
    db.query(fetchbucketavgquery, [id], (fetchavgError, fetchavgResult) => {
      if (fetchavgError) {
        return res.status(401).json({ message: 'Unable to fetch bucket', fetchavgError });
      }
      return res.status(200).json({ fetchavgResult });
    })
  }
  catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

function getDataByCustomDate(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const startDate = req.query.start;
    const endDate = req.query.end;

    // const endDate = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const sql = `SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (30 * 60)) * (30 * 60)) AS bucket_start_time,
          AVG(Temperature) AS Temperature,
          AVG(Humidity) AS Humidity,
          AVG(flowRate) AS flowRate,
          AVG(TemperatureR) AS TemperatureR,
          AVG(TemperatureB) AS TemperatureB ,
          AVG(TemperatureY) AS TemperatureY,
          ROUND(AVG(Pressure), 1) AS Pressure,
          MAX(totalVolume) AS Totalizer,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= ? AND TimeStamp <= ?
        GROUP BY
          DeviceUID,
          bucket_start_time
        ORDER BY
          DeviceUID,
          bucket_start_time`;
    //const sql2 = `SELECT * FROM actual_data WHERE DeviceUID = ? AND TimeStamp >= ? AND TimeStamp <= ?`;
    db.query(sql, [deviceId, startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'], (fetchError, results) => {
      if (fetchError) {
        // console.error('Error fetching data:', error);
        return res.status(401).json({ message: 'Error while fetching data', fetchError });
      }

      res.json({ data: results });
    });
  } catch (error) {
    // console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
}

function getDataByCustomDateStatus(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const startDate = req.query.start;
    const endDate = req.query.end;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const sql = `SELECT Status, COUNT(*) as count FROM tms_trigger_logs WHERE DeviceUID = ? AND TimeStamp >= ? AND TimeStamp <= ? GROUP BY Status`;
    db.query(sql, [deviceId, startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Calculate total count
      const totalCount = results.reduce((total, entry) => total + entry.count, 0);

      // Calculate percentage for each status
      const dataWithPercentage = results.map((entry) => ({
        status: entry.Status,
        count: entry.count,
        percentage: (entry.count / totalCount) * 100
      }));

      res.json({ dataStatus: dataWithPercentage });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getDeviceDetails(req, res) {
  try {
    const deviceId = req.params.deviceId;

    // Validate the deviceId parameter if necessary

    const deviceDetailsQuery = 'SELECT * FROM tms_devices WHERE DeviceUID = ?';
    db.query(deviceDetailsQuery, [deviceId], (error, deviceDetail) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (deviceDetail.length === 0) {
        // Handle the case when no device details are found
        return res.status(404).json({ message: 'Device details not found' });
      }

      res.status(200).json(deviceDetail);
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getLiveStatusDetails(req, res) {
  try {
    const deviceId = req.params.deviceId;

    // Validate the deviceId parameter if necessary

    const liveStatusQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? ORDER BY TimeStamp DESC LIMIT 1';
    db.query(liveStatusQuery, [deviceId], (error, liveStatus) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (liveStatus.length === 0) {
        // Handle the case when no live status details are found
        return res.status(404).json({ message: 'Live status details not found' });
      }

      res.status(200).json(liveStatus);
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getUserData(req, res) {
  try {
    const userId = req.params.userId;

    // Validate the deviceId parameter if necessary

    const userDetailsQuery = 'SELECT UserId, Username, FirstName, LastName, CompanyName, CompanyEmail, ContactNo, Location, UserType, PersonalEmail, Designation, Verified, is_online, block FROM tms_users WHERE UserId = ?';
    db.query(userDetailsQuery, [userId], (error, userDetail) => {
      if (error) {
        console.error('Error fetching User:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (userDetail.length === 0) {
        // Handle the case when no device details are found
        return res.status(404).json({ message: 'User details not found' });
      }

      res.status(200).json(userDetail);
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


function insertNewMessage(req, res) {
  try {
    const { sender, receiver, message } = req.body;
    const timestamp = new Date().toISOString();
    const isRead = 0; // Assuming the initial value for isRead is 0 (false)

    const insertQuery = 'INSERT INTO tms_notifications (sender, receiver, message, timestamp, isRead) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [sender, receiver, message, timestamp, isRead], (error, result) => {
      if (error) {
        console.error('Error inserting new message:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const insertedMessage = {
        sender,
        receiver,
        message,
        timestamp,
        isRead
      };

      res.status(201).json({ message: 'Message Send SuccessFully' });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function markMessageAsRead(req, res) {
  try {
    const messageId = req.params.messageId;

    const updateQuery = 'UPDATE tms_notifications SET isRead = 1 WHERE msgid = ?';
    db.query(updateQuery, [messageId], (error, result) => {
      if (error) {
        console.error('Error updating message status:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.status(200).json({ message: 'Message marked as read' });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function deleteMessage(req, res) {
  try {
    const messageId = req.params.messageId;

    const deleteQuery = 'DELETE FROM tms_notifications WHERE msgid = ?';
    db.query(deleteQuery, [messageId], (error, result) => {
      if (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.status(200).json({ message: 'Message deleted' });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function countUnreadMessages(req, res) {
  try {
    const receiver = req.params.receiver;

    const countQuery = 'SELECT COUNT(*) AS unreadCount FROM tms_notifications WHERE receiver = ? AND isRead = 0';
    db.query(countQuery, [receiver], (error, result) => {
      if (error) {
        console.error('Error counting unread messages:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const unreadCount = result[0].unreadCount;

      res.status(200).json({ unreadCount });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getUserMessages(req, res) {
  try {
    const receiver = req.params.receiver;

    const messagesQuery = 'SELECT * FROM tms_notifications WHERE receiver = ? ORDER BY timestamp desc';
    db.query(messagesQuery, [receiver], (error, messages) => {
      if (error) {
        console.error('Error fetching user messages:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(200).json(messages);
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function fetchCompanyUser(req, res) {
  const CompanyEmail = req.params.CompanyEmail;
  try {
    const query = 'SELECT UserId, FirstName, LastName, ContactNo, Location, UserType, PersonalEmail, Designation, is_online FROM tms_users where CompanyEmail = ?';
    db.query(query, [CompanyEmail], (error, users) => {
      if (error) {
        throw new Error('Error fetching users');
      }

      res.status(200).json(users);
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function addDeviceTrigger(req, res) {
  const { DeviceUID, TriggerValue, CompanyEmail } = req.body;
  try {
    const insertTriggerQuery = 'INSERT INTO tms_trigger (DeviceUID, TriggerValue, CompanyEmail) VALUES (?,?,?)';

    db.query(insertTriggerQuery, [DeviceUID, TriggerValue, CompanyEmail], (error, insertResult) => {
      if (error) {
        console.error('Error while inserting device:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      return res.json({ message: 'Device Trigger added successfully!' });
    });

  } catch (error) {
    console.error('Error in device check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function addDevice(req, res) {
  const { DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName, SMS, email, type, DeviceType } = req.body;

  try {
    const checkDeviceQuery = 'SELECT * FROM tms_devices WHERE DeviceUID = ?';
    const insertDeviceQuery = 'INSERT INTO tms_devices (DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName, IssueDate, SMS, email, type, DeviceType, endDate) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 365 DAY))';

    db.query(checkDeviceQuery, [DeviceUID], (error, checkResult) => {
      if (error) {
        console.error('Error while checking device:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({ message: 'Device already added' });
      }

      db.query(insertDeviceQuery, [DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName, SMS, email, type, DeviceType], (insertError, insertResult) => {
        if (insertError) {
          console.error('Error while inserting device:', insertError);
          return res.status(500).json({ message: 'Internal server error' });
        }

        return res.json({ message: 'Device added successfully!' });
      });
    });
  } catch (error) {
    console.error('Error in device check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


function barChartCustom(req, res) {
  const deviceId = req.params.deviceId;
  const startDate = req.query.start;
  const endDate = req.query.end;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Invalid parameters' });
  }


  // Fetch data for the given date range
  const queryRange = `
    SELECT DATE(TimeStamp) AS date,
           MAX(totalVolume) AS endVolume,
           MIN(totalVolume) AS startVolume
    FROM actual_data
    WHERE DeviceUID = ? AND TimeStamp BETWEEN ? AND ?
    GROUP BY DATE(TimeStamp)
    ORDER BY date ASC
  `;

  db.query(queryRange, [deviceId, startDate, endDate], (err, resultRange) => {
    connection.release();

    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Calculate total consumption for each date
    const datewiseConsumption = resultRange.map((row) => ({
      date: row.date,
      totalConsumption: row.endVolume - row.startVolume,
    }));

    return res.json(datewiseConsumption);
  });
}

function getTotalVolumeForToday(req, res) {
  const { deviceId } = req.params;
  try {
    // Fetch the very first entry for today
    const fetchFirstEntryQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND DATE(TimeStamp) = CURDATE() ORDER BY EntryID ASC LIMIT 1';

    // Fetch the latest entry for today
    const fetchLatestEntryQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND DATE(TimeStamp) = CURDATE() ORDER BY EntryID DESC LIMIT 1';

    // Fetch the very first entry for yesterday
    const fetchFirstEntryYesterdayQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND DATE(TimeStamp) = CURDATE() - INTERVAL 1 DAY ORDER BY EntryID ASC LIMIT 1';

    // Fetch the latest entry for yesterday
    const fetchLatestEntryYesterdayQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND DATE(TimeStamp) = CURDATE() - INTERVAL 1 DAY ORDER BY EntryID DESC LIMIT 1';

    db.query(fetchFirstEntryQuery, [deviceId], (fetchFirstError, fetchFirstResult) => {
      if (fetchFirstError) {
        console.error('Error while fetching the first entry:', fetchFirstError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      db.query(fetchLatestEntryQuery, [deviceId], (fetchLatestError, fetchLatestResult) => {
        if (fetchLatestError) {
          console.error('Error while fetching the latest entry:', fetchLatestError);
          return res.status(500).json({ message: 'Internal server error' });
        }

        db.query(fetchFirstEntryYesterdayQuery, [deviceId], (fetchFirstYesterdayError, fetchFirstYesterdayResult) => {
          if (fetchFirstYesterdayError) {
            console.error('Error while fetching the first entry for yesterday:', fetchFirstYesterdayError);
            return res.status(500).json({ message: 'Internal server error' });
          }

          db.query(fetchLatestEntryYesterdayQuery, [deviceId], (fetchLatestYesterdayError, fetchLatestYesterdayResult) => {
            if (fetchLatestYesterdayError) {
              console.error('Error while fetching the latest entry for yesterday:', fetchLatestYesterdayError);
              return res.status(500).json({ message: 'Internal server error' });
            }

            const todayConsumption = fetchLatestResult[0].totalVolume - fetchFirstResult[0].totalVolume;
            const yesterdayConsumption = fetchLatestYesterdayResult[0].totalVolume - fetchFirstYesterdayResult[0].totalVolume;

            return res.json({ today: todayConsumption, yesterday: yesterdayConsumption });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


// function getTotalVolumeForTodayEmail(req, res) {
//   const { CompanyEmail } = req.params;

//   try {
//     // Fetch devices for the given company email
//     const fetchDevicesQuery = 'SELECT * FROM tms_devices WHERE CompanyEmail = ? AND (DeviceType = "ws" OR DeviceType = "fs" OR DeviceType = "ts")';
//     db.query(fetchDevicesQuery, [CompanyEmail], (fetchError, devices) => {
//       if (fetchError) {
//         console.error('Error while fetching devices:', fetchError);
//         return res.status(500).json({ message: 'Internal server error' });
//       }

//       // Array to store promises for fetching consumption data
//       const promises = [];

//       // Iterate through each device
//       devices.forEach(device => {
//         const deviceId = device.DeviceUID;

//         // Function to fetch the latest entry for a specific day
//         const fetchDayEntry = (dayOffset) => {
//           const fetchDayEntryQuery = `
//             SELECT * FROM tms_Day_Consumption 
//             WHERE DeviceUID = ? AND DATE(TimeStamp) = CURDATE() - INTERVAL ${dayOffset} DAY
//             ORDER BY TimeStamp DESC LIMIT 1
//           `;

//           return new Promise((resolve, reject) => {
//             db.query(fetchDayEntryQuery, [deviceId], (fetchError, fetchResult) => {
//               if (fetchError) {
//                 console.error(`Error while fetching day entry for day ${dayOffset}:`, fetchError);
//                 reject(fetchError);
//               } else {
//                 const dayConsumption = fetchResult.length > 0 ? fetchResult[0].totalVolume : 0;
//                 resolve(dayConsumption);
//               }
//             });
//           });
//         };

//         // Fetch today's and yesterday's consumption concurrently
//         const todayPromise = fetchDayEntry(0);
//         const yesterdayPromise = fetchDayEntry(1);

//         // Push promises into the array
//         promises.push(
//           Promise.all([todayPromise, yesterdayPromise])
//             .then(([todayConsumption, yesterdayConsumption]) => ({
//               [deviceId]: [{ today: todayConsumption, yesterday: yesterdayConsumption }],
//             }))
//         );
//       });

//       // Wait for all promises to resolve
//       Promise.all(promises)
//         .then((consumptionData) => {
//           res.json(consumptionData);
//         })
//         .catch((error) => {
//           console.error('Error in device retrieval:', error);
//           res.status(500).json({ message: 'Internal server error' });
//         });
//     });
//   } catch (error) {
//     console.error('Error in device retrieval:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }
async function getTotalVolumeForTodayEmail(req, res) {
  const { CompanyEmail } = req.params;

  // Helper function to execute database queries with promises
  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  };

  try {
    // SQL query to fetch total volumes for today and yesterday
    const fetchVolumeQuery = `
      SELECT 
        d.DeviceUID,
        MAX(CASE WHEN DATE(c.TimeStamp) = CURDATE() THEN c.totalVolume ELSE NULL END) - 
        MIN(CASE WHEN DATE(c.TimeStamp) = CURDATE() THEN c.totalVolume ELSE NULL END) AS todayVolume,
        MAX(CASE WHEN DATE(c.TimeStamp) = CURDATE() - INTERVAL 1 DAY THEN c.totalVolume ELSE NULL END) - 
        MIN(CASE WHEN DATE(c.TimeStamp) = CURDATE() - INTERVAL 1 DAY THEN c.totalVolume ELSE NULL END) AS yesterdayVolume
      FROM 
        tms_devices d
      LEFT JOIN 
        clean_data c ON d.DeviceUID = c.DeviceUID
      WHERE 
        d.CompanyEmail = ? 
        AND d.DeviceType IN ('ws', 'fs', 'ts')
      GROUP BY 
        d.DeviceUID;
    `;

    // Execute the query
    const results = await executeQuery(fetchVolumeQuery, [CompanyEmail]);

    // Format the data to match the required response structure
    const formattedData = results.map((row) => ({
      [row.DeviceUID]: [
        {
          today: row.todayVolume || 0,
          yesterday: row.yesterdayVolume || 0,
        },
      ],
    }));

    // Send the formatted data as the response
    res.json(formattedData);
  } catch (error) {
    console.error('Error while fetching total volume data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}



function getTotalVolumeForMonth(req, res) {
  const { deviceId } = req.params;
  try {
    // Fetch the very first entry for the current month
    const fetchFirstEntryCurrentMonthQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND YEAR(TimeStamp) = YEAR(CURDATE()) AND MONTH(TimeStamp) = MONTH(CURDATE()) ORDER BY EntryID ASC LIMIT 1';

    // Fetch the latest entry for the current month
    const fetchLatestEntryCurrentMonthQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND YEAR(TimeStamp) = YEAR(CURDATE()) AND MONTH(TimeStamp) = MONTH(CURDATE()) ORDER BY EntryID DESC LIMIT 1';

    // Fetch the very first entry for the previous month
    const fetchFirstEntryPreviousMonthQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND YEAR(TimeStamp) = YEAR(CURDATE()) AND MONTH(TimeStamp) = MONTH(CURDATE()) - 1 ORDER BY EntryID ASC LIMIT 1';

    // Fetch the latest entry for the previous month
    const fetchLatestEntryPreviousMonthQuery = 'SELECT * FROM actual_data WHERE DeviceUID = ? AND YEAR(TimeStamp) = YEAR(CURDATE()) AND MONTH(TimeStamp) = MONTH(CURDATE()) - 1 ORDER BY EntryID DESC LIMIT 1';

    const handleResult = (error, result) => {
      if (error) {
        console.error('Error while fetching data:', error);
        return 0; // Return 0 if an error occurs
      }
      return result.length > 0 ? result[0].totalVolume : 0; // Return the totalVolume if available, else return 0
    };

    db.query(fetchFirstEntryCurrentMonthQuery, [deviceId], (fetchFirstCurrentMonthError, fetchFirstCurrentMonthResult) => {
      db.query(fetchLatestEntryCurrentMonthQuery, [deviceId], (fetchLatestCurrentMonthError, fetchLatestCurrentMonthResult) => {
        db.query(fetchFirstEntryPreviousMonthQuery, [deviceId], (fetchFirstPreviousMonthError, fetchFirstPreviousMonthResult) => {
          db.query(fetchLatestEntryPreviousMonthQuery, [deviceId], (fetchLatestPreviousMonthError, fetchLatestPreviousMonthResult) => {
            const currentMonthConsumption = handleResult(fetchLatestCurrentMonthError, fetchLatestCurrentMonthResult) - handleResult(fetchFirstCurrentMonthError, fetchFirstCurrentMonthResult);
            const previousMonthConsumption = handleResult(fetchLatestPreviousMonthError, fetchLatestPreviousMonthResult) - handleResult(fetchFirstPreviousMonthError, fetchFirstPreviousMonthResult);

            return res.json({ currentMonth: currentMonthConsumption, previousMonth: previousMonthConsumption });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getTotalVolumeForMonthEmail(req, res) {
  const { CompanyEmail } = req.params;

  // Helper function to execute database queries with promises
  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  };

  try {
    // SQL query to fetch total volumes for the current and previous months
    const fetchVolumeQuery = `
      SELECT 
        d.DeviceUID,
        MAX(CASE 
                WHEN MONTH(c.TimeStamp) = MONTH(CURDATE()) 
                    AND YEAR(c.TimeStamp) = YEAR(CURDATE()) 
                THEN c.totalVolume 
            END) - 
        MIN(CASE 
                WHEN MONTH(c.TimeStamp) = MONTH(CURDATE()) 
                    AND YEAR(c.TimeStamp) = YEAR(CURDATE()) 
                THEN c.totalVolume 
            END) AS thisMonthVolume,
        MAX(CASE 
                WHEN MONTH(c.TimeStamp) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
                    AND YEAR(c.TimeStamp) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
                THEN c.totalVolume 
            END) - 
        MIN(CASE 
                WHEN MONTH(c.TimeStamp) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
                    AND YEAR(c.TimeStamp) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
                THEN c.totalVolume 
            END) AS lastMonthVolume
    FROM 
        tms_devices d
    LEFT JOIN 
        clean_data c ON d.DeviceUID = c.DeviceUID
    WHERE 
        d.CompanyEmail = ?
        AND d.DeviceType IN ('ws', 'fs', 'ts')
    GROUP BY 
        d.DeviceUID;
    `;

    // Execute the query
    const results = await executeQuery(fetchVolumeQuery, [CompanyEmail]);

    // Format the data to match the required response structure
    const formattedData = results.map((row) => ({
      [row.DeviceUID]: [
        {
          thisMonth: row.thisMonthVolume || 0,
          lastMonth: row.lastMonthVolume || 0,
        },
      ],
    }));

    // Send the formatted data as the response
    res.json(formattedData);
  } catch (error) {
    console.error('Error while fetching total volume data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getTotalVolumeForDuration(req, res) {
  const { deviceId } = req.params;
  const { interval } = req.query;

  try {
    let sql;
    switch (interval) {
      case '1hour':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600) AS TimeStamp,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        GROUP BY
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600)
        ORDER BY
          DeviceUID,
          TimeStamp;`;
        break;
      case '12hour':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600) AS TimeStamp,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
        GROUP BY
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600)
        ORDER BY
          DeviceUID,
          TimeStamp;`
        break;
      case '1day':
        sql = `
        SELECT
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600) AS TimeStamp,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        GROUP BY
          DeviceUID,
          FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600)
        ORDER BY
          DeviceUID,
          TimeStamp;`
        break;
      case '7day':
        sql = `
        SELECT
          DeviceUID,
          DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp))) AS TimeStamp,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY
          DeviceUID,
          DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp)))
        ORDER BY
          DeviceUID,
          TimeStamp;`
        break;
      case '30day':
        sql = `
        SELECT
          DeviceUID,
          DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp))) AS TimeStamp,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY
          DeviceUID,
          DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp)))
        ORDER BY
          DeviceUID,
          TimeStamp;`
        break;
      case '6month':
        sql = `
        SELECT
          DeviceUID,
          DATE_FORMAT(TimeStamp, '%Y-%m') AS TimeStamp,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY
          DeviceUID,
          DATE_FORMAT(TimeStamp, '%Y-%m')
        ORDER BY
          DeviceUID,
          TimeStamp;`
        break;
      case '12month':
        sql = `
        SELECT
          DeviceUID,
          DATE_FORMAT(TimeStamp, '%Y-%m') AS TimeStamp,
          MAX(totalVolume) - MIN(totalVolume) AS totalVolume
        FROM
          actual_data
        WHERE
          DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY
          DeviceUID,
          DATE_FORMAT(TimeStamp, '%Y-%m')
        ORDER BY
          DeviceUID,
          TimeStamp;`
        break;
      default:
        return res.status(400).json({ message: 'Invalid time interval' });
    }

    db.query(sql, [deviceId], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ data: results });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// function getTotalVolumeForDuration(req, res) {
//   const { deviceId } = req.params;
//   const { interval } = req.query;

//   try {
//     let sql;
//     switch (interval) {
//       case '1hour':
//         sql = `
//         SELECT
//           DeviceUID,
//           FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600) AS TimeStamp,
//           MAX(totalVolume) - MIN(totalVolume) AS totalVolume
//         FROM
//           actual_data
//         WHERE
//           DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
//         GROUP BY
//           DeviceUID,
//           FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600)
//         ORDER BY
//           DeviceUID,
//           TimeStamp;`;
//         break;
//       case '12hour':
//         sql = `
//         SELECT
//           DeviceUID,
//           FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600) AS TimeStamp,
//           MAX(totalVolume) - MIN(totalVolume) AS totalVolume
//         FROM
//           actual_data
//         WHERE
//           DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
//         GROUP BY
//           DeviceUID,
//           FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600)
//         ORDER BY
//           DeviceUID,
//           TimeStamp;`
//         break;
//       case '1day':
//         sql = `
//         SELECT
//           DeviceUID,
//           FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600) AS TimeStamp,
//           MAX(totalVolume) - MIN(totalVolume) AS totalVolume
//         FROM
//           actual_data
//         WHERE
//           DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
//         GROUP BY
//           DeviceUID,
//           FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / 3600) * 3600)
//         ORDER BY
//           DeviceUID,
//           TimeStamp;`
//         break;
//       case '7day':
//         sql = `
//         SELECT
//           DeviceUID,
//           DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp))) AS TimeStamp,
//           MAX(totalVolume) - MIN(totalVolume) AS totalVolume
//         FROM
//           actual_data
//         WHERE
//           DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
//         GROUP BY
//           DeviceUID,
//           DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp)))
//         ORDER BY
//           DeviceUID,
//           TimeStamp;`
//         break;
//       case '30day':
//         sql = `
//         SELECT
//           DeviceUID,
//           DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp))) AS TimeStamp,
//           MAX(totalVolume) - MIN(totalVolume) AS totalVolume
//         FROM
//           actual_data
//         WHERE
//           DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
//         GROUP BY
//           DeviceUID,
//           DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp)))
//         ORDER BY
//           DeviceUID,
//           TimeStamp;`
//         break;
//       case '6month':
//         sql = `
//         SELECT
//           DeviceUID,
//           DATE_FORMAT(TimeStamp, '%Y-%m') AS TimeStamp,
//           MAX(totalVolume) - MIN(totalVolume) AS totalVolume
//         FROM
//           actual_data
//         WHERE
//           DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
//         GROUP BY
//           DeviceUID,
//           DATE_FORMAT(TimeStamp, '%Y-%m')
//         ORDER BY
//           DeviceUID,
//           TimeStamp;`
//         break;
//       case '12month':
//         sql = `
//         SELECT
//           DeviceUID,
//           DATE_FORMAT(TimeStamp, '%Y-%m') AS TimeStamp,
//           MAX(totalVolume) - MIN(totalVolume) AS totalVolume
//         FROM
//           actual_data
//         WHERE
//           DeviceUID = ? AND TimeStamp >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
//         GROUP BY
//           DeviceUID,
//           DATE_FORMAT(TimeStamp, '%Y-%m')
//         ORDER BY
//           DeviceUID,
//           TimeStamp;`
//         break;
//       default:
//         return res.status(400).json({ message: 'Invalid time interval' });
//     }

//     db.query(sql, [deviceId], (error, results) => {
//       if (error) {
//         console.error('Error fetching data:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//       }

//       // Assuming `results` looks like this:
//       // [{"DeviceUID":"SL02202339","TimeStamp":"2024-10-04T18:30:00.000Z","totalVolume":12690},
//       //  {"DeviceUID":"SL02202339","TimeStamp":"2024-10-05T18:30:00.000Z","totalVolume":7032},
//       //  {"DeviceUID":"SL02202339","TimeStamp":"2024-10-08T18:30:00.000Z","totalVolume":1518}]

//       const filledData = fillMissingDates(results, interval);
//       res.json({ data: filledData });
//     });
//   } catch (error) {
//     console.error('Error in device retrieval:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }

// function fillMissingDates(data, interval) {
//   const filledData = [];
//   let dateFormat;

//   // Define the date format based on interval
//   switch (interval) {
//     case '1day':
//     case '7day':
//     case '30day':
//       dateFormat = 'YYYY-MM-DD';
//       break;
//     case '12month':
//     case '6month':
//       dateFormat = 'YYYY-MM';
//       break;
//     default:
//       dateFormat = 'YYYY-MM-DD';
//   }

//   // Convert string timestamps to moment objects
//   const startDate = moment(data[0].TimeStamp).startOf('day');
//   const endDate = moment(data[data.length - 1].TimeStamp).startOf('day');

//   let currentDate = startDate.clone();

//   let i = 0;
//   while (currentDate.isSameOrBefore(endDate)) {
//     if (i < data.length && moment(data[i].TimeStamp).isSame(currentDate, 'day')) {
//       // If the current date matches the data entry, push it as-is
//       filledData.push(data[i]);
//       i++;
//     } else {
//       // If there is a missing date, create an entry with an interpolated value
//       const prevVolume = i > 0 ? data[i - 1].totalVolume : 0;
//       const nextVolume = i < data.length ? data[i].totalVolume : prevVolume;

//       // Linear interpolation between previous and next known values
//       const daysBetween = moment(data[i].TimeStamp).diff(currentDate, 'days') || 1;
//       const interpolatedVolume = Math.round(prevVolume + ((nextVolume - prevVolume) / daysBetween));

//       filledData.push({
//         DeviceUID: data[0].DeviceUID,
//         TimeStamp: currentDate.format('YYYY-MM-DD'), // Adjust format
//         totalVolume: interpolatedVolume,
//       });
//     }

//     // Move to the next day
//     currentDate.add(1, 'day');
//   }

//   return filledData;
// }

function getWaterConsumptionForDateRange(req, res) {
  const { deviceId, startDate, endDate } = req.params;

  try {
    // Fetch entries within the specified date range
    const fetchEntriesQuery = 'SELECT DeviceUID, DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp))) AS TimeStamp, MAX(totalVolume) - MIN(totalVolume) AS totalVolume FROM actual_data WHERE DeviceUID = ? AND TimeStamp >= ? AND TimeStamp <= ? GROUP BY DeviceUID, DATE(FROM_UNIXTIME(UNIX_TIMESTAMP(TimeStamp))) ORDER BY DeviceUID, TimeStamp;';

    db.query(fetchEntriesQuery, [deviceId, startDate + ' 00:00:00', endDate + ' 23:59:59'], (fetchError, fetchResult) => {
      if (fetchError) {
        console.error('Error while fetching entries:', fetchError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      return res.json({ data: fetchResult });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function deleteDevice(req, res) {
  try {
    const deviceUID = req.params.deviceUID;

    // Delete device from tms_devices table
    const deleteDeviceQuery = 'DELETE FROM tms_devices WHERE DeviceUID = ?';
    db.query(deleteDeviceQuery, [deviceUID], (error, result) => {
      if (error) {
        console.error('Error deleting device:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Device not found' });
      }

      // Delete related records from tms_triggers table
      const deleteTriggersQuery = 'DELETE FROM tms_trigger WHERE DeviceUID = ?';
      db.query(deleteTriggersQuery, [deviceUID], (triggersError, triggersResult) => {
        if (triggersError) {
          console.error('Error deleting triggers:', triggersError);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Device and related triggers deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


function editUser(req, res) {
  const userId = req.params.userId;
  const { FirstName, LastName, PersonalEmail, ContactNo, Location, Designation, UserType } = req.body;
  const UserCheckQuery = 'SELECT * FROM tms_users WHERE UserId = ?';

  db.query(UserCheckQuery, [userId], (error, UserCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (UserCheckResult.length === 0) {
        return res.status(400).json({ message: 'User not found!' });
      }

      const usersQuery = 'Update tms_users SET FirstName = ?, LastName = ?, PersonalEmail = ?, ContactNo = ?, Location = ?, Designation = ?, UserType = ? WHERE UserId = ?';

      db.query(usersQuery, [FirstName, LastName, PersonalEmail, ContactNo, Location, Designation, UserType, userId], (error, devices) => {
        if (error) {
          console.error('Error fetching users:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'User Updated SuccessFully' });
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// function fetchLatestEntry(req, res) {
//   const { companyEmail } = req.params;
//   const fetchUserDevicesQuery = `SELECT * FROM tms_devices WHERE CompanyEmail = ?`;
//   const fetchLatestEntryQuery = `SELECT * FROM actual_data WHERE DeviceUID = ? ORDER BY EntryID DESC LIMIT 1`;
//   const defaultEntry = {
//     EntryID: 0,
//     DeviceUID: null,
//     Temperature: null,
//     TemperatureR: null,
//     TemperatureY: null,
//     TemperatureB: null,
//     Humidity: null,
//     flowRate: null,
//     totalVolume: null,
//     TimeStamp: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
//     ip_address: "0.0.0.0",
//     status: null
//   };

//   db.query(fetchUserDevicesQuery, [companyEmail], (fetchUserDevicesError, devices) => {
//     if (fetchUserDevicesError) {
//       return res.status(401).json({ message: 'Error while fetching devices' });
//     }

//     if (devices.length === 0) {
//       return res.status(404).json({ message: 'No devices found for the user' });
//     }

//     const promises = devices.map(device => {
//       return new Promise((resolve, reject) => {
//         const deviceId = device.DeviceUID;
//         db.query(fetchLatestEntryQuery, [deviceId], (fetchLatestEntryError, fetchLatestEntryResult) => {
//           if (fetchLatestEntryError) {
//             reject({ [deviceId]: { entry: [defaultEntry] } });
//           } else {
//             const deviceEntry = fetchLatestEntryResult.length === 0 ? [defaultEntry] : fetchLatestEntryResult;
//             resolve({ [deviceId]: { entry: deviceEntry } });
//           }
//         });
//       });
//     });

//     Promise.all(promises)
//       .then(results => {
//         res.json({ latestEntry: results });
//       })
//       .catch(error => {
//         res.status(500).json({ message: 'Error while fetching data for some devices', error });
//       });
//   });
// }
// function fetchLatestEntry(req, res) {
//   const { companyEmail } = req.params;
//   const optimizedQuery = `
//     SELECT d.DeviceUID, ad.EntryID, ad.Temperature, ad.TemperatureR, ad.TemperatureY, ad.TemperatureB,
//            ad.Humidity, ad.flowRate, ad.totalVolume, ad.TimeStamp, ad.ip_address, ad.status
//     FROM tms_devices d
//     LEFT JOIN (
//       SELECT DeviceUID, MAX(EntryID) as MaxEntryID
//       FROM actual_data
//       GROUP BY DeviceUID
//     ) latest_entry ON d.DeviceUID = latest_entry.DeviceUID
//     LEFT JOIN actual_data ad ON latest_entry.MaxEntryID = ad.EntryID
//     WHERE d.CompanyEmail = ?;
//   `;

//   const defaultEntry = {
//     EntryID: 0,
//     DeviceUID: null,
//     Temperature: null,
//     TemperatureR: null,
//     TemperatureY: null,
//     TemperatureB: null,
//     Humidity: null,
//     flowRate: null,
//     totalVolume: null,
//     TimeStamp: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
//     ip_address: "0.0.0.0",
//     status: null
//   };

//   db.query(optimizedQuery, [companyEmail], (error, results) => {
//     if (error) {
//       return res.status(500).json({ message: 'Error while fetching data', error });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No devices found for the user' });
//     }

//     const latestEntries = results.map(result => {
//       if (result.EntryID === null) {
//         return { [result.DeviceUID]: { entry: [defaultEntry] } };
//       }
//       return { [result.DeviceUID]: { entry: [result] } };
//     });

//     res.json({ latestEntry: latestEntries });
//   });
// }
const fetchLatestEntry = (req, res) => {
  const { companyEmail } = req.params;

  // Optimized Query using MAX(TimeStamp) for latest entry retrieval
  const optimizedQuery = `
      WITH LatestEntries AS (
          SELECT ad.DeviceUID, MAX(ad.TimeStamp) AS LatestTimeStamp
          FROM actual_data ad FORCE INDEX (idx_device_timestamp)  -- Force efficient index use
          WHERE ad.TimeStamp >= NOW() - INTERVAL 7 DAY  -- Partition Pruning for faster retrieval
          GROUP BY ad.DeviceUID
      )
      SELECT d.DeviceUID, ad.EntryID, ad.Temperature, ad.TemperatureR, ad.TemperatureY, ad.TemperatureB,
             ad.Humidity, ad.flowRate, ad.totalVolume, ad.TimeStamp, ad.ip_address, ad.status
      FROM tms_devices d
      LEFT JOIN LatestEntries le ON d.DeviceUID = le.DeviceUID
      LEFT JOIN actual_data ad FORCE INDEX (idx_device_timestamp) 
      ON ad.DeviceUID = le.DeviceUID AND ad.TimeStamp = le.LatestTimeStamp
      WHERE d.CompanyEmail = ?;
  `;

  const defaultEntry = {
      EntryID: 0,
      DeviceUID: null,
      Temperature: null,
      TemperatureR: null,
      TemperatureY: null,
      TemperatureB: null,
      Humidity: null,
      flowRate: null,
      totalVolume: null,
      TimeStamp: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      ip_address: "0.0.0.0",
      status: null
  };

  db.query(optimizedQuery, [companyEmail], (error, results) => {
      if (error) {
          return res.status(500).json({ message: 'Error while fetching data', error });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'No devices found for the user' });
      }

      const latestEntries = results.map(result => {
          if (result.TimeStamp === null) {
              return { [result.DeviceUID]: { entry: [defaultEntry] } };
          }
          return { [result.DeviceUID]: { entry: [result] } };
      });

      res.json({ latestEntry: latestEntries });
  });
};



function fetchDeviceTotal(req, res) {
  const deviceId = req.params.deviceId;
  const deviceQuery = 'select * from tms_Day_Consumption where DeviceUID = ? AND (TimeStamp) = CURDATE()';
  try {
    db.query(deviceQuery, [deviceId], (error, deviceResult) => {
      if (error) {
        console.error('Error during device check:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(200).json(deviceResult);
    });
  } catch (error) {
    console.error('Error in device check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function editDeviceFromSetting(req, res) {
  const deviceId = req.params.deviceId;
  const { DeviceLocation, DeviceName, DeviceTrigger, DeviceType } = req.body;
  const deviceCheckQuery = 'SELECT * FROM tms_devices WHERE DeviceUID = ?';

  db.query(deviceCheckQuery, [deviceId], (error, deviceCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (deviceCheckResult.length === 0) {
        return res.status(400).json({ message: 'Device not found!' });
      }

      const devicesQuery = 'UPDATE tms_devices SET DeviceLocation = ?, DeviceName = ?, DeviceType = ? WHERE DeviceUID = ?';
      const devicesTriggerQuery = 'UPDATE tms_trigger SET TriggerValue = ? WHERE DeviceUID = ?';

      db.query(devicesQuery, [DeviceLocation, DeviceName, DeviceType, deviceId], (error, devicesResult) => {
        if (error) {
          console.error('Error updating device:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        db.query(devicesTriggerQuery, [DeviceTrigger, deviceId], (error, triggerResult) => {
          if (error) {
            console.error('Error updating trigger:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          res.json({ message: 'Device Updated Successfully' });
        });
      });
    } catch (error) {
      console.error('Error updating device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function getTriggerData(req, res) {
  const CompanyEmail = req.params.CompanyEmail;

  const getquery = 'SELECT * FROM tms_trigger WHERE CompanyEmail=?';

  try {
    db.query(getquery, [CompanyEmail], (error, getresult) => {
      if (error) {
        console.error('Error getting user data:', error);
        return res.status(500).json({ message: 'Internet server error' });
      }
      res.status(200).json(getresult);
    })
  }
  catch (error) {
    console.error('Error occured check:', error)
    res.status(500).json({ message: 'Error in fetching data' })
  }
}

function updateTrigger(req, res) {
  const DeviceUID = req.params.DeviceUID;

  const { PersonalEmail, TriggerValue, ContactNO, DeviceName, interval } = req.body;

  const updateUserQuery = `
    UPDATE tms_trigger 
    SET PersonalEmail=?, TriggerValue=?, ContactNO=?, DeviceName=?, \`interval\`=?
    WHERE DeviceUID=?
  `;

  try {
    db.query(updateUserQuery, [PersonalEmail, TriggerValue, ContactNO, DeviceName, interval, DeviceUID], (UpdateUserError, updateUserResult) => {
      if (UpdateUserError) {
        console.error('Error updating User data:', UpdateUserError);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.status(200).json(updateUserResult);
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Error updating User data' });
  }
}




function deletetriggeruser(req, res) {

  const DeviceUID = req.params.DeviceUID;
  const deletequery = 'DELETE FROM tms_trigger WHERE DeviceUID=?';
  db.query(deletequery, [DeviceUID], (error) => {
    if (error) {
      console.error('Error deleting data:', error);
      res.status(404).send('error occured');
      return;
    }
    res.json({ message: 'Device Trigger deleted successfully' });
  })

}


function UpdateWhatsapp(req, res) {
  const DeviceUID = req.params.DeviceUID;
  const { Whatsapp } = req.body;

  const UpdateWhatsappQuery = 'UPDATE tms_trigger SET Whatsapp = ? WHERE DeviceUID = ?';

  db.query(UpdateWhatsappQuery, [Whatsapp, DeviceUID], (UpdateWhatsappError, UpdateWhatsappResult) => {
    if (UpdateWhatsappError) {
      return res.status(401).json({ message: 'error during updating Whatsapp ', UpdateWhatsappError });
    }
    res.status(200).json({ message: 'Whatsapp Updated Successfully' });
  });
}


function UpdateMail(req, res) {
  const DeviceUID = req.params.DeviceUID;
  const { Mail } = req.body;
  const UpdateMailQuery = 'UPDATE tms_trigger SET Mail = ? WHERE DeviceUID = ?';

  db.query(UpdateMailQuery, [Mail, DeviceUID], (UpdateMailError, UpdateMailResult) => {
    if (UpdateMailError) {
      return res.status(401).json({ message: 'error during updating Mail ', UpdateMailError });
    }
    res.status(200).json({ message: 'Mail Updated Successfully' });
  });
}

function last5alerts(req, res) {
  const DeviceUID = req.params.DeviceUID;
  const triggerValueQuery = `SELECT TriggerValue FROM tms_trigger WHERE DeviceUID = ?;`;

  // Fetch the trigger value first
  db.query(triggerValueQuery, [DeviceUID], (err, triggerValueResult) => {
    if (err) {
      console.error('Error fetching trigger value', err);
      return res.status(500).send('Error occurred');
    }

    if (triggerValueResult.length === 0) {
      return res.status(404).send('Trigger value not found');
    }

    const TriggerValue = triggerValueResult[0].TriggerValue;

    // Combine the four temperature parameters into the WHERE clause
    const query = `
      SELECT TimeStamp, Temperature, TemperatureR, TemperatureY, TemperatureB
      FROM actual_data 
      WHERE DeviceUID = ? AND (Temperature >= ? OR TemperatureR >= ? OR TemperatureY >= ? OR TemperatureB >= ?)
      ORDER BY TimeStamp 
      LIMIT 5;`;

    db.query(query, [DeviceUID, TriggerValue, TriggerValue, TriggerValue, TriggerValue], (err, results) => {
      if (err) {
        console.error('Error fetching data', err);
        return res.status(500).send('Error occurred');
      }
      // Send the results back as JSON
      res.status(200).json(results);
    });
  });
}


module.exports = {
  userDevices,
  editDevice,
  fetchDeviceTrigger,
  fetchAllDeviceTrigger,
  companyDetails,
  personalDetails,
  updatePassword,
  editDeviceTrigger,
  getDataByTimeInterval,
  getDataByCustomDate,
  getDataByTimeIntervalStatus,
  getDataByCustomDateStatus,
  getDeviceDetails,
  getLiveStatusDetails,
  getUserData,
  insertNewMessage,
  markMessageAsRead,
  deleteMessage,
  countUnreadMessages,
  getUserMessages,
  fetchCompanyUser,
  addDeviceTrigger,
  addDevice,
  barChartCustom,
  getTotalVolumeForToday,
  getTotalVolumeForMonth,
  getTotalVolumeForTodayEmail,
  getTotalVolumeForMonthEmail,
  getTotalVolumeForDuration,
  getWaterConsumptionForDateRange,
  deleteDevice,
  editUser,
  fetchLatestEntry,
  avg_interval,
  fetchDeviceTotal,
  editDeviceFromSetting,
  getTriggerData,
  updateTrigger,
  deletetriggeruser,
  UpdateWhatsapp,
  UpdateMail,
  last5alerts,
};