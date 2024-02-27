const mqtt = require('mqtt');

const broker = 'ws://dashboard.senselive.in:9001';


const options = {
  username: 'Sense2023', 
  password: 'sense123',
};
// Connect to the MQTT broker
const mqttClient = mqtt.connect(broker,options);

// Handle MQTT connection event
mqttClient.on('connect', () => {
  const topic = `Sense/Live/SL02202348`;

  mqttClient.subscribe(topic, (error) => {
    if (error) {
      console.error(`Error subscribing to ${topic}:`, error);
    } else {
     console.log(`Subscribed to ${topic}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
    const data = JSON.parse(message);
    console.log("Topic:-", topic,"Data:-", data)
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.on('exit', () => {
  mysqlPool.end();
});
