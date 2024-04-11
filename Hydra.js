const mqtt = require('mqtt');
const axios = require('axios');

const broker = 'ws://dashboard.senselive.in:9001';

const options = {
  username: 'Sense2023',
  password: 'sense123',
};

const mqttClient = mqtt.connect(broker, options);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('Sense/#', (error) => {
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
    if(data.DeviceUID === 'SL02202410' || data.DeviceUID === 'SL02202411') {
      const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Kolkata', // Set the appropriate timezone
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const formattedData = {
        "can_number": '111111111',
        "mtr_number": data.DeviceUID,
        "reading": data.totalizer || data.totalVolume || data.TemperatureR,
        "timestamp": timestamp.replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$2-$1-$3 $4:$5:$6')
      };

      sendData(formattedData); // Call sendData immediately after formatting the data
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Function to send data in the desired format
async function sendData(data) {
    const jsonData = {
      "cans_data": [data]
    };
  
    try {
//      https://mdm.hyderabadwater.gov.in/apis/api-testing.json
      const response = await axios.post('https://mdm.hyderabadwater.gov.in/apis/api-testing.json', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Data sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  }