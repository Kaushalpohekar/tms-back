// const mqtt = require('mqtt');
// const mysql = require('mysql2');
// const os = require('os');

// const broker = 'mqtt://broker.senselive.io:1883';

// const mysqlConfig = {
//   // host: 'senso.senselive.in',
//   // user: 'mysql',
//   // password: 'sense!123',
//   // database: 'tms',
//   // port: 3306,
//   host: 'sl02-mysql.mysql.database.azure.com',
//   user: 'senselive',
//   password: 'SenseLive@2030',
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
//   mqttClient.subscribe('Elkem/Lora/water/#', (error) => {
//     if (error) {
//       console.error('Error subscribing to all topics:', error);
//     } else {
//       console.log('Subscribed to all topics');
//     }
//   });
// });

// mqttClient.on('message', (topic, message) => {
//   try {
//     const Collecteddata = JSON.parse(message);

//     const processNodeData = (nodeData, nodeName) => {
//       const data = nodeData.Payload?.payload?.modbusData || nodeData.payload?.modbusData || '';

//       const isValidData = (value) => {
//         return value !== null && value !== undefined && value !== '' && !isNaN(value);
//       };

//       const conditions = [
//         { fields: ['field1', 'field2'], deviceUID: `${nodeName}_01`, extraFields: ['totalVolume', 'flowRate'] },
//         { fields: ['field3'], deviceUID: `${nodeName}_02`, extraFields: ['level'] },
//         { fields: ['field4', 'field5'], deviceUID: `${nodeName}_03`, extraFields: ['totalVolume', 'flowRate'] },
//         { fields: ['field6'], deviceUID: `${nodeName}_04`, extraFields: ['level'] },
//         { fields: ['field7', 'field8'], deviceUID: `${nodeName}_05`, extraFields: ['totalVolume', 'flowRate'] },
//         { fields: ['field9'], deviceUID: `${nodeName}_06`, extraFields: ['level'] },
//         { fields: ['field10', 'field11'], deviceUID: `${nodeName}_07`, extraFields: ['totalVolume', 'flowRate'] },
//         { fields: ['field12'], deviceUID: `${nodeName}_08`, extraFields: ['level'] },
//         { fields: ['field13', 'field14'], deviceUID: `${nodeName}_09`, extraFields: ['totalVolume', 'flowRate'] },
//         { fields: ['field15'], deviceUID: `${nodeName}_10`, extraFields: ['level'] },
//         { fields: ['field16', 'field17'], deviceUID: `${nodeName}_11`, extraFields: ['totalVolume', 'flowRate'] },
//         { fields: ['field18'], deviceUID: `${nodeName}_12`, extraFields: ['level'] },
//         { fields: ['field19', 'field20'], deviceUID: `${nodeName}_13`, extraFields: ['totalVolume', 'flowRate'] }
//       ];

//       conditions.forEach(condition => {
//         const [firstField, secondField] = condition.fields;

//         if (isValidData(data[firstField]) && (condition.fields.length === 1 || isValidData(data[secondField]))) {
//           let storedData = { DeviceUID: condition.deviceUID };

//           condition.extraFields.forEach((field, index) => {
//             storedData[field] = data[condition.fields[index]];
//           });
//           InsertIntoDataBase(storedData);
//           //console.log(`Node: ${nodeName}, DeviceUID: ${condition.deviceUID}, Data:`, storedData);
//         } else {
//           //console.log(`Node: ${nodeName}, DeviceUID: ${condition.deviceUID} - No valid data for ${firstField}${secondField ? ` and ${secondField}` : ''}`);
//         }
//       });
//     };

//     if (Collecteddata.node_name === 'SL_LoRa_00001') {
//       processNodeData(Collecteddata.node_data, 'SL_LoRa_00001');
//     } else if (Collecteddata.node_name === 'SL_LoRa_00002') {
//       processNodeData(Collecteddata.node_data, 'SL_LoRa_00002');
//     } else if (Collecteddata.node_name === 'SL_LoRa_00003') {
//       processNodeData(Collecteddata.node_data, 'SL_LoRa_00003');
//     } else if (Collecteddata.node_name === 'SL_LoRa_00004') {
//       processNodeData(Collecteddata.node_data, 'SL_LoRa_00004');
//     } else if (Collecteddata.node_name === 'SL_LoRa_00005') {
//       processNodeData(Collecteddata.node_data, 'SL_LoRa_00005');
//     } else if (Collecteddata.node_name === 'SL_LoRa_00006') {
//       processNodeData(Collecteddata.node_data, 'SL_LoRa_00006');
//     } else {
//       console.log(`Unrecognized node name: ${Collecteddata.node_name}`);
//     }

//   } catch (error) {
//     console.error('Error processing message:', error);
//   }
// });



// function InsertIntoDataBase(data) {

//   console.log(data);
//   const insertQuery = `
//     INSERT INTO actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity, flowRate, Pressure, totalVolume, ip_address)
//     VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//   const insertValues = [
//     data.DeviceUID,
//     data.Temperature,
//     data.TemperatureR,
//     data.TemperatureY,
//     data.TemperatureB,
//     data.Humidity,
//     data.flowRate || data.FlowRate || data.Level || data.level || null, // Default to null if not found
//     data.Pressure,
//     data.totalVolume || data.Totalizer || null, // Default to null if not found
//     localIpAddress, // Ensure `localIpAddress` is defined or passed as a parameter
//   ];

//   mysqlPool.query(insertQuery, insertValues, (error) => {
//     if (error) {
//       console.error('Error inserting data into MySQL:', error);
//     } else {
//       console.log('Data inserted into MySQL');
//     }
//   });
// }

// mqttClient.on('error', (error) => {
//   console.error('MQTT error:', error);
// });

// process.on('exit', () => {
//   mysqlPool.end();
// });
const mqtt = require('mqtt');
const mysql = require('mysql2');
const os = require('os');

const broker = 'mqtt://broker.senselive.io:1883';

const mysqlConfig = {
  host: 'sl02-mysql.mysql.database.azure.com',
  user: 'senselive',
  password: 'SenseLive@2030',
  database: 'tms',
  ssl: {
    rejectUnauthorized: false,
  },
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
  mqttClient.subscribe('Elkem/Lora/water/#', (error) => {
    if (error) {
      console.error('Error subscribing to all topics:', error);
    } else {
      console.log('Subscribed to all topics');
    }
  });
});

// Conditions for processing node data
const conditions = {
  SL_LoRa_00001: [
    { fields: ['field1'], deviceUID: 'SL_LoRa_00001_01', extraFields: ['totalVolume'] },
    { fields: ['field2'], deviceUID: 'SL_LoRa_00001_01', extraFields: ['flowRate'] },
    { fields: ['field3'], deviceUID: 'SL_LoRa_00001_02', extraFields: ['flowRate'] },
  ],
  SL_LoRa_00002: [
    { fields: ['field1'], deviceUID: 'SL_LoRa_00002_01', extraFields: ['totalVolume'] },
    { fields: ['field2'], deviceUID: 'SL_LoRa_00002_01', extraFields: ['flowRate'] },
  ],
  SL_LoRa_00003: [
    { fields: ['field1'], deviceUID: 'SL_LoRa_00003_01', extraFields: ['totalVolume'] },
    { fields: ['field2'], deviceUID: 'SL_LoRa_00003_01', extraFields: ['flowRate'] },
  ],
  SL_LoRa_00004: [
    { fields: ['field1'], deviceUID: 'SL_LoRa_00004_01', extraFields: ['totalVolume'] },
    { fields: ['field2'], deviceUID: 'SL_LoRa_00004_01', extraFields: ['flowRate'] },
  ],
  SL_LoRa_00005: [
    { fields: ['field1'], deviceUID: 'SL_LoRa_00005_01', extraFields: ['totalVolume'] },
    { fields: ['field2'], deviceUID: 'SL_LoRa_00005_01', extraFields: ['flowRate'] },
    { fields: ['field3'], deviceUID: 'SL_LoRa_00005_02', extraFields: ['totalVolume'] },
    { fields: ['field4'], deviceUID: 'SL_LoRa_00005_02', extraFields: ['flowRate'] },
    { fields: ['field5'], deviceUID: 'SL_LoRa_00005_03', extraFields: ['totalVolume'] },
    { fields: ['field6'], deviceUID: 'SL_LoRa_00005_03', extraFields: ['flowRate'] },
    { fields: ['field7'], deviceUID: 'SL_LoRa_00005_04', extraFields: ['flowRate'] },
    { fields: ['field8'], deviceUID: 'SL_LoRa_00005_05', extraFields: ['flowRate'] },
    { fields: ['field9'], deviceUID: 'SL_LoRa_00005_06', extraFields: ['flowRate'] },
    { fields: ['field10'], deviceUID: 'SL_LoRa_00005_07', extraFields: ['totalVolume'] },
    { fields: ['field11'], deviceUID: 'SL_LoRa_00005_07', extraFields: ['flowRate'] },
  ],
  SL_LoRa_00006: [
    { fields: ['field1'], deviceUID: 'SL_LoRa_00006_01', extraFields: ['totalVolume'] },
    { fields: ['field2'], deviceUID: 'SL_LoRa_00006_01', extraFields: ['flowRate'] },
    { fields: ['field3'], deviceUID: 'SL_LoRa_00006_02', extraFields: ['totalVolume'] },
    { fields: ['field4'], deviceUID: 'SL_LoRa_00006_02', extraFields: ['flowRate'] },
    { fields: ['field5'], deviceUID: 'SL_LoRa_00006_03', extraFields: ['totalVolume'] },
    { fields: ['field6'], deviceUID: 'SL_LoRa_00006_03', extraFields: ['flowRate'] },
    { fields: ['field7'], deviceUID: 'SL_LoRa_00006_04', extraFields: ['flowRate'] },
    { fields: ['field8'], deviceUID: 'SL_LoRa_00006_05', extraFields: ['flowRate'] },
    { fields: ['field9'], deviceUID: 'SL_LoRa_00006_06', extraFields: ['flowRate'] },
    { fields: ['field10'], deviceUID: 'SL_LoRa_00006_07', extraFields: ['totalVolume'] },
    { fields: ['field11'], deviceUID: 'SL_LoRa_00006_07', extraFields: ['flowRate'] },
  ],
  SL_LoRa_00007: [
    { fields: ['field1'], deviceUID: 'SL_LoRa_00007_01', extraFields: ['totalVolume'] },
    { fields: ['field2'], deviceUID: 'SL_LoRa_00007_01', extraFields: ['flowRate'] },
    { fields: ['field3'], deviceUID: 'SL_LoRa_00007_02', extraFields: ['totalVolume'] },
    { fields: ['field4'], deviceUID: 'SL_LoRa_00007_02', extraFields: ['flowRate'] },
  ],
  
};

mqttClient.on('message', (topic, message) => {
  try {
    const Collecteddata = JSON.parse(message);

    const processNodeData = (nodeData, nodeName) => {
      const data = nodeData.Payload?.payload?.modbusData || nodeData.payload?.modbusData || '';

      const isValidData = (value) => {
        return value !== null && value !== undefined && value !== '' && !isNaN(value);
      };

      const nodeConditions = conditions[nodeName];

      if (nodeConditions) {
        nodeConditions.forEach((condition) => {
          const [firstField] = condition.fields;

          if (isValidData(data[firstField])) {
            let storedData = { DeviceUID: condition.deviceUID };

            condition.extraFields.forEach((field, index) => {
              storedData[field] = data[condition.fields[index]];
            });
            InsertIntoDataBase(storedData);
          }
        });
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

function InsertIntoDataBase(data) {
  console.log('Data to insert:', data);
  const insertQuery = `
    INSERT INTO actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity, flowRate, Pressure, totalVolume, ip_address)
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
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

  mysqlPool.query(insertQuery, insertValues, (error) => {
    if (error) {
      console.error('Error inserting data into MySQL:', error);
    } else {
      console.log('Data inserted into MySQL');
    }
  });
}

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.on('exit', () => {
  mysqlPool.end();
});
