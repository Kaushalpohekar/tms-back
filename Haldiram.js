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
  host: 'data.senselive.in',
  user: 'senselive',
  password: 'SenseLive@2025',
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
  mqttClient.subscribe('Haldiram/LT_temp/MAC[06...17]', (error) => {
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

    const insertQuery = `
    INSERT INTO actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity, flowRate, Pressure, totalVolume, ip_address)
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      data.DeviceUID || 'SL_Haldiram',
      data.Temperature || data.Temp_4,
      data.TemperatureR || data.Temp_1,
      data.TemperatureY || data.Temp_2,
      data.TemperatureB || data.Temp_3,
      data.Humidity,
      data.flowRate || data.FlowRate || data.Level || data.level,
      data.Pressure,
      data.totalVolume || data.Totalizer,
      localIpAddress,
    ];

    mysqlPool.query(insertQuery, insertValues, (error) => {
      if (error) {
        console.error('Error inserting data into MySQL:', error);
      } else {
        console.log('Data inserted into MySQL');
      }
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
