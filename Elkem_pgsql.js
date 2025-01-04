const mqtt = require('mqtt');
const { Pool } = require('pg'); // PostgreSQL client
const os = require('os');

const broker = 'mqtt://broker.senselive.io:1883';

const pgConfig = {
  host: 'senselive.postgres.database.azure.com',
  user: 'kaushal',
  password: 'Kaushal@123',
  database: 'ems',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pgPool = new Pool(pgConfig);
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

const options = {
  username: 'Sense2023',
  password: 'sense123',
};

const mqttClient = mqtt.connect(broker, options);

const conditions = {
  SL_LoRa_00001: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00001_01', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field3'], deviceUID: 'SL_LoRa_00001_02', extraFields: ['flowRate'] },
  ],
  SL_LoRa_00002: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00002_01', extraFields: ['totalVolume', 'flowRate'] },
  ],
  SL_LoRa_00003: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00003_01', extraFields: ['totalVolume', 'flowRate'] },
  ],
  SL_LoRa_00004: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00004_01', extraFields: ['totalVolume', 'flowRate'] },
  ],
  SL_LoRa_00005: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00005_01', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field3', 'field4'], deviceUID: 'SL_LoRa_00005_02', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field5', 'field6'], deviceUID: 'SL_LoRa_00005_03', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field7'], deviceUID: 'SL_LoRa_00005_04', extraFields: ['flowRate'] },
    { fields: ['field8'], deviceUID: 'SL_LoRa_00005_05', extraFields: ['flowRate'] },
    { fields: ['field9'], deviceUID: 'SL_LoRa_00005_06', extraFields: ['flowRate'] },
    { fields: ['field10', 'field11'], deviceUID: 'SL_LoRa_00005_07', extraFields: ['totalVolume', 'flowRate'] },
  ],
  SL_LoRa_00006: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00006_01', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field3', 'field4'], deviceUID: 'SL_LoRa_00006_02', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field5', 'field6'], deviceUID: 'SL_LoRa_00006_03', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field7'], deviceUID: 'SL_LoRa_00006_04', extraFields: ['flowRate'] },
    { fields: ['field8'], deviceUID: 'SL_LoRa_00006_05', extraFields: ['flowRate'] },
    { fields: ['field9'], deviceUID: 'SL_LoRa_00006_06', extraFields: ['flowRate'] },
    { fields: ['field10', 'field11'], deviceUID: 'SL_LoRa_00006_07', extraFields: ['totalVolume', 'flowRate'] },
  ],
  SL_LoRa_00007: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00007_01', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field3', 'field4'], deviceUID: 'SL_LoRa_00007_02', extraFields: ['totalVolume', 'flowRate'] },
  ],
  SL_LoRa_00008: [
    { fields: ['field1', 'field2'], deviceUID: 'SL_LoRa_00008_01', extraFields: ['totalVolume', 'flowRate'] },
    { fields: ['field3', 'field4'], deviceUID: 'SL_LoRa_00008_02', extraFields: ['totalVolume', 'flowRate'] },
  ],
};

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('Elkem/Lora/water/#', (error) => {
    if (error) {
      console.error('Error subscribing to all topics:', error);
    } else {
      console.log('Subscribed to all topics');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const Collecteddata = JSON.parse(message);

    const processNodeData = (nodeData, nodeName) => {
      const data = nodeData.Payload?.payload?.modbusData || nodeData.payload?.modbusData || '';

      const isValidData = (value) => value !== null && value !== undefined && value !== '' && !isNaN(value);

      const nodeConditions = conditions[nodeName];

      if (nodeConditions) {
        const aggregatedData = {};

        nodeConditions.forEach((condition) => {
          const deviceUID = condition.deviceUID;

          if (!aggregatedData[deviceUID]) {
            aggregatedData[deviceUID] = { DeviceUID: deviceUID };
          }

          condition.fields.forEach((field, index) => {
            if (isValidData(data[field])) {
              aggregatedData[deviceUID][condition.extraFields[index]] = data[field];
            }
          });
        });

        Object.values(aggregatedData).forEach(InsertIntoDataBase);
      } else {
        console.log(`No conditions defined for node: ${nodeName}`);
      }
    };

    if (conditions[Collecteddata.node_name]) {
      processNodeData(Collecteddata.node_data, Collecteddata.node_name);
    } else {
      console.log(`Unrecognized node name: ${Collecteddata.node_name}`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

async function InsertIntoDataBase(data) {
  console.log('Data to insert:', data);
  const insertQuery = `
    INSERT INTO tms.actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity, flowRate, Pressure, totalVolume, ip_address)
    VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  const insertValues = [
    data.DeviceUID,
    data.Temperature || null,
    data.TemperatureR || null,
    data.TemperatureY || null,
    data.TemperatureB || null,
    data.Humidity || null,
    data.flowRate || null,
    data.Pressure || null,
    data.totalVolume || null,
    localIpAddress,
  ];

  try {
    await pgPool.query(insertQuery, insertValues);
    console.log('Data inserted into PostgreSQL');
  } catch (error) {
    console.error('Error inserting data into PostgreSQL:', error);
  }
}

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.on('exit', async () => {
  await pgPool.end();
});
