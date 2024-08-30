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

let currentFlowRate = 540;
let isIncreasing = Math.random() > 0.5; // Randomly decide if it's increasing or decreasing

function generateControlledFlowRateData(deviceId) {
  const DeviceUID = deviceId;

  if (isIncreasing) {
    currentFlowRate += getRandomNumber(0.1, 1.0);
    if (currentFlowRate > 630) {
      isIncreasing = false;
    }
  } else {
    currentFlowRate -= getRandomNumber(0.1, 1.0);
    if (currentFlowRate < 540) {
      isIncreasing = true;
    }
  }

  const data = {
    DeviceUID,
    flowRate: parseFloat(currentFlowRate.toFixed(2))
  };

  return JSON.stringify(data);
}

const client = mqtt.connect(brokerOptions);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  const deviceId = `SL02202423`;  // Device ID
  const topic = `Sense/Live/${deviceId}`;

  // Publisher: Controlled flow rate data only
  setInterval(() => {
    const message = generateControlledFlowRateData(deviceId);
    client.publish(topic, message);
    console.log("Published to", topic, message);
  }, 5 * 1000);  // Set the interval to 1 second (1000 ms)
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
