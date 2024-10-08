const mqtt = require('mqtt');

// MQTT broker URL
const brokerOptions = {
  hostname: 'dashboard.senselive.in',
  port: 9001,         // Ensure this is the correct port for WS/WSS
  protocol: 'ws',    // Use 'wss' for WebSocket Secure if needed
  username: 'Sense2023',
  password: 'sense123',
};

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
} 

let totalVolume = 0;

function generateRandomData(deviceId) {
  const DeviceUID = deviceId;
  const Temperature = parseFloat(getRandomNumber(10, 20).toFixed(1));
  const flowRate = parseFloat(getRandomNumber(1, 5).toFixed(2)); // Example range: 1 to 5
  totalVolume += flowRate;

  const data = {
    DeviceUID,
    Temperature,
    flowRate,
    totalVolume
  };

  return JSON.stringify(data);
}

const client = mqtt.connect(brokerOptions);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  const deviceId = `2409`;  // Updated deviceId to 2409
  const topic = `Sense/Live/${deviceId}`;

  setInterval(() => {
    const message = generateRandomData(deviceId);
    client.publish(topic, message);
    console.log("publish for ", topic, message);
  }, 1000);  // Set the interval to 1 second (1000 ms)
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
