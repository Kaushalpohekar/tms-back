const db = require('../db');

async function fetchLatestEntry(req, res) {
  try {
    const deviceQuery = `
      SELECT tms_trigger.DeviceUID, tms_trigger.ContactNO, tms_trigger.DeviceName, tms_trigger.TriggerValue, tms_trigger.interval, tms_trigger.Whatsapp  
      FROM tms_trigger
      JOIN tms_devices ON tms_trigger.DeviceUID = tms_devices.DeviceUID
      WHERE tms_trigger.Whatsapp = 1;
    `;
  
    const fetchLatestEntryQuery = `
      SELECT * FROM actual_data WHERE DeviceUID = ? ORDER BY EntryID DESC LIMIT 1
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
  
    const devices = await new Promise((resolve, reject) => {
      db.query(deviceQuery, (fetchUserDevicesError, devices) => {
        if (fetchUserDevicesError) {
          reject(fetchUserDevicesError);
        } else {
          resolve(devices);
        }
      });
    });
  
    if (devices.length === 0) {
      return res.status(404).json({ message: 'No devices found for the user' });
    }
  
    const promises = devices.map(async ({ DeviceUID }) => {
      try {
        const fetchLatestEntryResult = await new Promise((resolve, reject) => {
          db.query(fetchLatestEntryQuery, [DeviceUID], (fetchLatestEntryError, result) => {
            if (fetchLatestEntryError) {
              reject(fetchLatestEntryError);
            } else {
              resolve(result);
            }
          });
        });
  
        const deviceEntry = fetchLatestEntryResult.length === 0 ? [defaultEntry] : fetchLatestEntryResult;
        return { [DeviceUID]: { entry: deviceEntry } };
      } catch (error) {
        return { [DeviceUID]: { entry: [defaultEntry] } };
      }
    });
  
    const latestEntry = await Promise.all(promises);
    res.json({ latestEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching data for some devices', error });
  }
}


async function fetchLastSendMsgTime(req, res) {
  try {
    const deviceQuery = `
      SELECT tms_trigger.DeviceUID, tms_trigger.ContactNO, tms_trigger.DeviceName, tms_trigger.TriggerValue, tms_trigger.interval, tms_trigger.Whatsapp  
      FROM tms_trigger
      JOIN tms_devices ON tms_trigger.DeviceUID = tms_devices.DeviceUID
      WHERE tms_trigger.Whatsapp = 1;
    `;
  
    const fetchLatestEntryQuery = `
      SELECT * FROM tms_alert_interval WHERE DeviceUID = ? ORDER BY EntryID DESC LIMIT 1
    `;
  
    const defaultEntry = {
      id: 0,
      DeviceUID: null,
      lastSend: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  
    const devices = await new Promise((resolve, reject) => {
      db.query(deviceQuery, (fetchUserDevicesError, devices) => {
        if (fetchUserDevicesError) {
          reject(fetchUserDevicesError);
        } else {
          resolve(devices);
        }
      });
    });
  
    if (devices.length === 0) {
      return res.status(404).json({ message: 'No devices found for the user' });
    }
  
    const promises = devices.map(async ({ DeviceUID }) => {
      try {
        const fetchLatestEntryResult = await new Promise((resolve, reject) => {
          db.query(fetchLatestEntryQuery, [DeviceUID], (fetchLatestEntryError, result) => {
            if (fetchLatestEntryError) {
              reject(fetchLatestEntryError);
            } else {
              resolve(result);
            }
          });
        });
  
        const deviceEntry = fetchLatestEntryResult.length === 0 ? [defaultEntry] : fetchLatestEntryResult;
        return { [DeviceUID]: { entry: deviceEntry } };
      } catch (error) {
        return { [DeviceUID]: { entry: [defaultEntry] } };
      }
    });
  
    const latestEntry = await Promise.all(promises);
    res.json({ latestEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching data for some devices', error });
  }
}



module.exports = {
  fetchLatestEntry,
  fetchLastSendMsgTime
};