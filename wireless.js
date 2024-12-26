const mqtt = require('mqtt');
const mysql = require('mysql2');
const os = require('os');

const broker = 'ws://dashboard.senselive.in:9001';

const mysqlConfig = {
  // host: 'senso.senselive.in',
  // user: 'mysql',
  // password: 'sense!123',
  // database: 'tms',
  // port: 3306,
  host: 'sl02-mysql.mysql.database.azure.com',
  user: 'senselive',
  password: 'SenseLive@2030',
  database: 'tms',
  ssl: {
    rejectUnauthorized: false,
  }
};

const mysqlPool = mysql.createPool(mysqlConfig);

const localIpAddress = getLocalIpAddress();

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

console.log('Local IP Address:', localIpAddress);

const options = {
  username: 'Sense2023',
  password: 'sense123',
};

const mqttClient = mqtt.connect(broker, options);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('TN-08:D1:F9:A1:0E:54/data', (error) => {
    if (error) {
      console.error('Error subscribing to all topics:', error);
    } else {
      console.log('Subscribed to all topics');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message);

    // Extract temperature values from the payload
    const temp1 = data.data.Temp1 / 10;
    const temp2 = data.data.Temp2 / 10;
    const temp3 = data.data.Temp3 / 10;
    const temp4 = data.data.Temp4 / 10;

    // Define corresponding DeviceUID values for each temperature
    const devices = [
      { DeviceUID: 'SLWLSELKEM1', Temperature: temp1 },
      { DeviceUID: 'SLWLSELKEM2', Temperature: temp2 },
      { DeviceUID: 'SLWLSELKEM3', Temperature: temp3 },
      { DeviceUID: 'SLWLSELKEM4', Temperature: temp4 },
    ];

    // Iterate through the devices array and insert data for each temperature
    devices.forEach((device) => {
      const insertQuery = `
        INSERT INTO actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity, flowRate, Pressure, totalVolume, ip_address)
        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertValues = [
        device.DeviceUID,
        device.Temperature,
        null, // TemperatureR (if required, set accordingly)
        null, // TemperatureY (if required, set accordingly)
        null, // TemperatureB (if required, set accordingly)
        null, // Humidity (if required, set accordingly)
        null, // flowRate (if required, set accordingly)
        null, // Pressure (if required, set accordingly)
        null, // totalVolume (if required, set accordingly)
        localIpAddress, // Local IP address
      ];

      mysqlPool.query(insertQuery, insertValues, (error) => {
        if (error) {
          console.error('Error inserting data into MySQL:', error);
        } else {
          console.log(`Data inserted for DeviceUID ${device.DeviceUID}`);
        }
      });
    });
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.on('exit', () => {
  mysqlPool.end();
});
