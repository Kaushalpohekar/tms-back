const mqtt = require('mqtt');

// MQTT broker URL
// const brokerUrl = 'mqtt://65.2.127.156:1883';
const brokerOptions = {
  hostname: 'dashboard.senselive.in',
  port: 9001,         // Make sure to use the correct port for WSS
  protocol: 'ws',    // Use 'wss' for WebSocket Secure
  username: 'Sense2023',
  password: 'sense123',
};

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function generateRandomData(deviceId) {
  const DeviceUID = deviceId;
  const Humidity = parseFloat(getRandomNumber(40, 70).toFixed(1));

  const data = {
    DeviceUID,
    Humidity,
  };

  return JSON.stringify(data);
}

const client = mqtt.connect(brokerOptions);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  const deviceId = `SL02202348`;
    const topic = `Sense/Live/${deviceId}`;

    setInterval(() => {
      const message = generateRandomData(deviceId);
      client.publish(topic, message);
      console.log("publish for ", topic, message);
    }, 20000);
});

client.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing MQTT connection.');
  client.end();
  process.exit();
});
