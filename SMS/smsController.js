// const twilio = require('twilio');
// const mysql = require('mysql2');
// const nodemailer = require('nodemailer');

// const accountSid = 'AC0d478e22325d6f2a719c3cdb78060b63';
// const authToken = 'd6d54643353a41a2be90be8d7f89080c';
// const twilioPhoneNumber = '+12187182899';
// const twilioClient = twilio(accountSid, authToken);

// const dbConfig = {
//   host: 'senselivedb.cn5vfllmzwrp.ap-south-1.rds.amazonaws.com',
//   user: 'admin',
//   password: 'sense123',
//   database: 'tmp',
// };

// const previousDeviceStates = {};

// const emailTransporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "soumyalokhande28@gmail.com",
//     pass: "rsbylikbfihbiwby"
//   }
// });

// function checkState() {
//   const connection = mysql.createConnection(dbConfig);

//   connection.query('SELECT id, device_name, phone_number, email, is_online, device_name FROM devices', (err, results) => {
//     if (err) {
//       console.error('Error fetching data from the database:', err);
//       connection.end();
//       return;
//     }

//     results.forEach((device) => {
//       const deviceId = device.id;
//       const previousState = previousDeviceStates[deviceId] || false;
//       const currentState = device.is_online === 1;

//       if (previousState !== currentState) {
//         previousDeviceStates[deviceId] = currentState;

//         const message = currentState
//           ? `${device.device_name} is online.`
//           : `${device.device_name} is offline.`;

//         sendSMS(device.phone_number, message);
//         sendEmail(device.email, message);
//       }
//     });

//     connection.end();
//   });
// }

// function sendSMS(to, body) {
//   twilioClient.messages
//     .create({
//       body: body,
//       to: to,
//       from: twilioPhoneNumber,
//     })
//     .then(() => {
//       console.log('SMS sent successfully:', body);
//     })
//     .catch((err) => {
//       console.error('Error sending SMS:', err);
//     });
// }

// function sendEmail(to, body) {
//   const mailOptions = {
//     from: 'your_email_address',
//     to: to,
//     subject: 'Device Status Update',
//     text: body,
//   };

//   emailTransporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//     } else {
//       console.log('Email sent successfully:', info.response);
//     }
//   });
// }

// module.exports = { checkState };

// const twilio = require('twilio');
// const mysql = require('mysql2');
// const nodemailer = require('nodemailer');

// const accountSid = 'AC0d478e22325d6f2a719c3cdb78060b63';
// const authToken = 'd6d54643353a41a2be90be8d7f89080c';
// const twilioPhoneNumber = '+12187182899';
// const twilioClient = twilio(accountSid, authToken);

// const dbConfig = {
//   host: 'senselivedb.cn5vfllmzwrp.ap-south-1.rds.amazonaws.com',
//   user: 'admin',
//   password: 'sense123',
//   database: 'tmp',
// };

// const previousDeviceStates = {};

// function checkState() {
//   const connection = mysql.createConnection(dbConfig);

//   connection.query('SELECT id, device_name, phone_number, email, is_online, is_heating FROM devices', (err, results) => {
//     if (err) {
//       console.error('Error fetching data from the database:', err);
//       connection.end();
//       return;
//     }

//     results.forEach((device) => {
//       const deviceId = device.id;
//       const previousState = previousDeviceStates[deviceId] || false;
//       const currentState = {
//         isOnline: device.is_online === 1,
//         isHeating: device.is_heating === 1,
//       };

//       if (previousState.isOnline !== currentState.isOnline || previousState.isHeating !== currentState.isHeating) {
//         previousDeviceStates[deviceId] = currentState;

//         let message;
//         if (currentState.isOnline) {
//           message = `${device.device_name} is online.`;
//         } else {
//           message = `${device.device_name} is offline.`;
//         }

//         if (currentState.isHeating) {
//           message += " Device is heating.";
//         } else {
//           message += " Device is not heating.";
//         }

//         sendSMS(device.phone_number, message);
//         sendEmail(device.email, message);
//       }
//     });

//     connection.end();
//   });
 
// }


// const emailTransporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "soumyalokhande28@gmail.com",
//     pass: "rsbylikbfihbiwby"
//   }
// });


// function sendSMS(to, body) {
//   twilioClient.messages
//     .create({
//       body: body,
//       to: to,
//       from: twilioPhoneNumber,
//     })
//     .then(() => {
//       console.log('SMS sent successfully:', body);
//     })
//     .catch((err) => {
//       console.error('Error sending SMS:', err);
//     });
// }

// function sendEmail(to, body) {
//   const mailOptions = {
//     from: 'your_email_address',
//     to: to,
//     subject: 'Device Status Update',
//     text: body,
//   };

//   emailTransporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//     } else {
//       console.log('Email sent successfully:', info.response);
//     }
//   });
// }

// module.exports = { checkState };

const twilio = require('twilio');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const accountSid = 'AC0d478e22325d6f2a719c3cdb78060b63';
const authToken = 'd6d54643353a41a2be90be8d7f89080c';
const twilioPhoneNumber = '+12187182899';
const twilioClient = twilio(accountSid, authToken);

const dbConfig = {
  host: 'senselivedb.cn5vfllmzwrp.ap-south-1.rds.amazonaws.com',
  user: 'admin',
  password: 'sense123',
  database: 'tmp',
};

const previousDeviceStates = {};

function checkState() {
  const connection = mysql.createConnection(dbConfig);

  connection.query('SELECT id, device_name, phone_number, email, is_online, is_heating FROM devices', (err, queryResults) => {
    if (err) {
      console.error('Error fetching data from the database:', err);
      connection.end();
      return;
    }

    const devices = queryResults;

    devices.forEach((device) => {
      const deviceId = device.id;
      const previousState = previousDeviceStates[deviceId] || false;
      const currentState = {
        isOnline: device.is_online === 1,
        isHeating: device.is_heating === 1,
      };

      if (previousState.isOnline !== currentState.isOnline || previousState.isHeating !== currentState.isHeating) {
        previousDeviceStates[deviceId] = currentState;

        let message;
        if (currentState.isOnline) {
          message = `${device.device_name} is online.`;
        } else {
          message = `${device.device_name} is offline.`;
        }

        if (currentState.isHeating) {
          message += " Device is heating.";
        } else {
          message += " Device is not heating.";
        }

        sendSMS(device.phone_number, message);
        sendEmail(device.email, renderEmailTemplate(devices)); // Use the rendered email template
      }
    });

    connection.end();
  });
}

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "soumyalokhande28@gmail.com",
    pass: "rsbylikbfihbiwby"
  }
});

function sendSMS(to, body) {
  twilioClient.messages
    .create({
      body: body,
      to: to,
      from: twilioPhoneNumber,
    })
    .then(() => {
      console.log('SMS sent successfully:', body);
    })
    .catch((err) => {
      console.error('Error sending SMS:', err);
    });
}

function sendEmail(to, body) {
  const mailOptions = {
    from: 'your_email_address',
    to: to,
    subject: 'Device Status Update',
    html: body, // Use the rendered HTML here
  };

  emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
}

function renderEmailTemplate(devices) {
  const templateFilePath = path.join(__dirname, 'views', 'device-status.ejs');
  const template = fs.readFileSync(templateFilePath, 'utf-8');

  return ejs.render(template, { devices });
}

module.exports = { checkState, renderEmailTemplate };