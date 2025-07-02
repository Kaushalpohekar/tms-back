// const mqtt = require('mqtt');
// const mysql = require('mysql2');
// const os = require('os');

// const broker = 'ws://dashboard.senselive.in:9001';

// const mysqlConfig = {
//   // host: 'senso.senselive.in',
//   // user: 'mysql',
//   // password: 'sense!123',
//   // database: 'tms',
//   // port: 3306,
//   host: 'data.senselive.in',
//   user: 'senselive',
//   password: 'SenseLive@2025',
//   database: 'tms',
//   ssl: {
//     rejectUnauthorized: false,
//   }
// };

// const mysqlPool = mysql.createPool(mysqlConfig);

// const localIpAddress = getLocalIpAddress();

// function getLocalIpAddress() {
//   const interfaces = os.networkInterfaces();
//   for (const key in interfaces) {
//     const iface = interfaces[key];
//     for (const item of iface) {
//       if (item.family === 'IPv4' && !item.internal) {
//         return item.address;
//       }
//     }
//   }
//   return 'Unknown';
// }

// console.log('Local IP Address:', localIpAddress);

// const options = {
//   username: 'Sense2023',
//   password: 'sense123',
// };

// const mqttClient = mqtt.connect(broker, options);

// mqttClient.on('connect', () => {
//   console.log('Connected to MQTT broker');
//   mqttClient.subscribe('Sense/#', (error) => {
//     if (error) {
//       console.error('Error subscribing to all topics:', error);
//     } else {
//       console.log('Subscribed to all topics');
//     }
//   });
// });

// mqttClient.on('message', (topic, message) => {
//   try {
//     const data = JSON.parse(message);
//     const insertQuery = `
//     INSERT INTO actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity, flowRate, Pressure, totalVolume, ip_address)
//     VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const insertValues = [
//       data.DeviceUID,
//       data.Temperature,
//       data.TemperatureR || data.Temp1,
//       data.TemperatureY || data.Temp2,
//       data.TemperatureB || data.Temp3,
//       data.Humidity,
//       data.flowRate || data.FlowRate || data.Level || data.level,
//       data.Pressure,
//       data.totalVolume || data.Totalizer,
//       localIpAddress,
//     ];

//     mysqlPool.query(insertQuery, insertValues, (error) => {
//       if (error) {
//         console.error('Error inserting data into MySQL:', error);
//       } else {
//         console.log('Data inserted into MySQL:- ', data.DeviceUID || data.device_uid);
//       }
//     });
//   } catch (error) {
//     //console.error('Error processing message:', error);
//   }
// });

// mqttClient.on('error', (error) => {
//   console.error('MQTT error:', error);
// });

// process.on('exit', () => {
//   mysqlPool.end();
// });
const mqtt = require('mqtt');
const mysql = require('mysql2');
const os = require('os');

const broker = 'ws://dashboard.senselive.in:9001';

const mysqlConfig = {
  host: 'data.senselive.in',
  user: 'senselive',
  password: 'SenseLive@2025',
  database: 'tms',
  ssl: { rejectUnauthorized: false }
};

const mysqlPool = mysql.createPool(mysqlConfig);

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    const iface = interfaces[key];
    for (const item of iface) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address;
      }
    }
  }
  return 'Unknown';
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getUniversalValue(data, possibleNames) {
  const normalizedData = {};
  for (const key in data) {
    if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) continue;
    normalizedData[normalizeKey(key)] = data[key];
  }

  for (const name of possibleNames) {
    const norm = normalizeKey(name);
    if (norm in normalizedData) return normalizedData[norm];
  }

  return null;
}

const localIpAddress = getLocalIpAddress();

const options = {
  username: 'Sense2023',
  password: 'sense123'
};

const mqttClient = mqtt.connect(broker, options);

mqttClient.on('connect', () => {
  mqttClient.subscribe('Sense/#', () => {});
});

mqttClient.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message);
    const devices = Array.isArray(payload.devices) ? payload.devices : [payload];

    devices.forEach((data) => {
      const insertQuery = `
        INSERT INTO actual_data (
          DeviceUID,
          Temperature,
          Timestamp,
          TemperatureR,
          TemperatureY,
          TemperatureB,
          Humidity,
          flowRate,
          Pressure,
          totalVolume,
          ip_address
        ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertValues = [
        getUniversalValue(data, ['DeviceUID']),
        getUniversalValue(data, ['Temperature']),
        getUniversalValue(data, ['TemperatureR', 'Temp1']),
        getUniversalValue(data, ['TemperatureY', 'Temp2']),
        getUniversalValue(data, ['TemperatureB', 'Temp3']),
        getUniversalValue(data, ['Humidity']),
        getUniversalValue(data, ['FlowRate', 'Level']),
        getUniversalValue(data, ['Pressure']),
        getUniversalValue(data, ['Totalizer', 'TotalVolume']),
        localIpAddress
      ];

      const deviceId = insertValues[0];

      if (deviceId) {
        mysqlPool.query(insertQuery, insertValues, (error) => {
          if (!error) {
            //console.log('Data stored for device:', deviceId);
          }
        });
      }
    });
  } catch (error) {}
});

mqttClient.on('error', () => {});

process.on('exit', () => {
  mysqlPool.end();
});
