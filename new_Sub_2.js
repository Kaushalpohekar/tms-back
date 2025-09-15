const mqtt = require('mqtt');
const mysql = require('mysql2');
const os = require('os');

const broker = 'mqtt://dashboard.senselive.in:1883';

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
    const devices = [];

    if (payload.DeviceUID) {
      devices.push(payload);
    }

    for (const key in payload) {
      const val = payload[key];
      if (
        typeof val === 'object' &&
        val !== null &&
        val.DeviceUID &&
        (val.FlowRate !== undefined || val.Totalizer !== undefined)
      ) {
        devices.push(val);
      }
    }

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
        getUniversalValue(data, ['FlowRate', 'flow_rate', 'Level', 'level']),
        getUniversalValue(data, ['Pressure']),
        getUniversalValue(data, ['Totalizer', 'TotalVolume']),
        localIpAddress
      ];

      const deviceId = insertValues[0];

      if (deviceId) {
        mysqlPool.query(insertQuery, insertValues, (error) => {
          if (!error) {
            console.log('Data stored for device:', deviceId);
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