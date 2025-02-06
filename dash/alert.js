const mysql = require("mysql2/promise");
const mqtt = require("mqtt");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const MQTT_BROKER = "ws://dashboard.senselive.in:9001";
const MQTT_USERNAME = "Sense2023";
const MQTT_PASSWORD = "sense123"; 

let deviceMap = new Map();
let lastSentMap = new Map();

const db = mysql.createPool({
    host: "sl02-mysql.mysql.database.azure.com",
    user: "senselive",
    password: "SenseLive@2030",
    database: "tms",
    ssl: {
        rejectUnauthorized: false,
    },
});


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'donotreplysenselive@gmail.com',
      pass: 'xgcklimtlbswtzfq',
    },
  });

  async function fetchDeviceData() {
    try {
        const [rows] = await db.query(`
            SELECT 
                d.DeviceUID, d.DeviceName, d.DeviceType, 
                t.interval, t.PersonalEmail, t.Whatsapp, t.TriggerValue, t.Mail
            FROM tms_devices d
            JOIN tms_trigger t ON d.DeviceUID = t.DeviceUID
            WHERE d.DeviceType IN ('T', 'TH', 'RYB', 't', 'th', 'ryb')
        `);

        rows.forEach(device => {
            let { DeviceUID, DeviceName, DeviceType, interval, PersonalEmail, Whatsapp, TriggerValue, Mail } = device;
            interval = parseInt(interval) || 10; // Default to 10 minutes

            let existingDevice = deviceMap.get(DeviceUID);

            // Only update if there's a change
            if (!existingDevice || 
                existingDevice.interval !== interval || 
                existingDevice.Mail !== Mail || 
                existingDevice.Whatsapp !== Whatsapp) {

                deviceMap.set(DeviceUID, {
                    DeviceName, DeviceType, interval, PersonalEmail, Whatsapp, TriggerValue, Mail
                });

                console.log(`Updated device settings for ${DeviceUID}`);
            }
        });

    } catch (error) {
        console.error("Error fetching device data:", error);
    }
}

async function processTrigger(deviceUID, payload) {
    if (!deviceMap.has(deviceUID) || !payload) return;
    const device = deviceMap.get(deviceUID);
    const currentTime = Date.now();
    const lastSentTime = lastSentMap.get(deviceUID) || 0;

    let temperature = null;
    if ("Temperature" in payload) {
        temperature = parseFloat(payload.Temperature);
    } else if ("TemperatureR" in payload || "TemperatureY" in payload || "TemperatureB" in payload) {
        temperature = Math.max(
            payload.TemperatureR || 0,
            payload.TemperatureY || 0,
            payload.TemperatureB || 0
        );
    }

    if (temperature === null || isNaN(temperature)) return;

    let intervalMillis = device.interval * 60 * 1000;

    if ((currentTime - lastSentTime) >= intervalMillis && temperature >= parseFloat(device.TriggerValue)) {
        await sendAlert(device, temperature);
        lastSentMap.set(deviceUID, currentTime);
        console.log(`Alert sent for ${deviceUID} at ${new Date(currentTime)}`);
    } else {
        //console.log(`Trigger ignored for ${deviceUID}. Either interval not met or value below threshold.`);
    }
}

// async function sendAlert(device, temperature) {
//     if (!device.Mail || device.Mail === "0") {
//         //console.log(`Email alerts are disabled for ${deviceUID}.`);
//         return;
//     }

//     const formattedTimestamp = new Intl.DateTimeFormat("en-US", {
//         month: "short",
//         day: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true,
//     }).format(new Date());

//     const emailHtml = await ejs.renderFile(path.join(__dirname, "mail-body", "demo.ejs"), {
//         deviceName: device.DeviceName,
//         thresholdTemp: device.TriggerValue,
//         currentTemp: temperature,
//         timestamp: formattedTimestamp
//     });

//     const mailOptions = {
//         from: "donotreplysenselive@gmail.com",
//         to: device.PersonalEmail,
//         subject: `Alert: Device ${device.DeviceName} Triggered`,
//         html: emailHtml
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         //console.log(`Alert sent to ${device.PersonalEmail}:`, info.response);
//     } catch (error) {
//         //console.error(`Error sending email to ${device.PersonalEmail}:`, error);
//     }
// }

async function sendAlert(device, temperature) {
    if (!device.Mail || device.Mail === "0") {
        return;
    }

    const formattedTimestamp = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(new Date());

    const templatePath = path.join(__dirname, "../mail-body/demo.ejs");

    fs.readFile(templatePath, "utf8", (err, templateData) => {
        if (err) {
            console.error("Error reading email template:", err);
            return;
        }

        const compiledTemplate = ejs.compile(templateData);
        const emailHtml = compiledTemplate({
            deviceName: device.DeviceName,
            thresholdTemp: device.TriggerValue,
            currentTemp: temperature,
            timestamp: formattedTimestamp,
        });

        const mailOptions = {
            from: "donotreplysenselive@gmail.com",
            to: "kaushalpohekar85@gmail.com",//device.PersonalEmail,
            subject: `Alert: Device ${device.DeviceName} Triggered`,
            html: emailHtml,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(`Error sending email to ${device.PersonalEmail}:`, error);
            } else {
                console.log(`✅ Alert sent to ${device.PersonalEmail}:`, info.response);
            }
        });
    });
}

const mqttClient = mqtt.connect(MQTT_BROKER, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD
});

mqttClient.on("connect", () => {
    console.log("Connected to MQTT Broker.");
    mqttClient.subscribe("Sense/Live/#", err => {
        if (err) console.error("Error subscribing to MQTT:", err);
    });
});

mqttClient.on("message", (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        if (!payload || !payload.DeviceUID) return;
        
        //console.log(`Received MQTT data: ${payload.DeviceUID} => ${JSON.stringify(payload)}`);
        processTrigger(payload.DeviceUID, payload);
    } catch (error) {
        //console.error("Error processing MQTT message:", error);
    }
});

setInterval(fetchDeviceData, 10000);

fetchDeviceData();
