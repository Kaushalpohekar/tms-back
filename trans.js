const mqtt = require('mqtt');
const mysql = require('mysql2');
const os = require('os');

const broker = 'ws://dashboard.senselive.in:9001';

const mysqlConfig = {
    host: 'data.senselive.in',
    user: 'senselive',
    password: 'SenseLive@2025',
    database: 'tms',
    port: 3306,
};

const mysqlPool = mysql.createPool(mysqlConfig);

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

        // Check if any of the required fields are present
        if (!(
            data.OTI_Temp || data.WTI_Temp || data.s1 || data.s2 || data.s3 || data.s4 ||
            data.oti_temp || data.wti_temp || data.S1 || data.S2 || data.S3 || data.S4
        )) {
            //console.log('Skipping data insertion due to absence of required fields');
            return;
        }

        const insertQuery = `
            INSERT INTO transformer_data (DeviceUID, OTI_Temp, WTI_Temp, S1, S2, S3, S4)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const insertValues = [
            data.DeviceUID,
            data.OTI_Temp || data.oti_temp,
            data.WTI_Temp || data.wti_temp,
            data.s1 || data.S1,
            data.s2 || data.S2,
            data.s3 || data.S3,
            data.s4 || data.S4,
        ];

        mysqlPool.query(insertQuery, insertValues, (error) => {
            if (error) {
                console.error('Error inserting data into MySQL:', error);
            } else {
                console.log('Data inserted into MySQL');
            }
        });
    } catch (error) {
        //console.error('Error processing message:', error);
    }
});

mqttClient.on('error', (error) => {
    console.error('MQTT error:', error);
});

process.on('exit', () => {
    mysqlPool.end();
});
