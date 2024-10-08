const express = require('express');
const router = express.Router();

const authentication = require('./auth/authentication');
const dashboard = require('./dash/dashboard.js');
const SA = require('./superadmin/SA.js');
const newSa = require('./superadmin/newSa.js');
const alert = require('./dash/alert.js');

// Authentication routes
router.post('/register', authentication.register);
router.post('/login', authentication.login);
router.post('/register-dashboard', authentication.register_dashboard);
router.get('/user', authentication.getUserDetails);
router.post('/verify', authentication.verifyToken);
router.post('/re-verify-mail', authentication.resendToken);
router.post('/forgot', authentication.forgotPassword);
router.post('/resend-forgot', authentication.resendResetToken);
router.post('/reset-password', authentication.resetPassword);
router.put('/setUserOnline/:UserId', authentication.setUserOnline);
router.put('/setUserOffline/:UserId', authentication.setUserOffline);
router.put('/users/:UserId/block', authentication.Block);

// Dashboard routes
router.get('/userdevices/:companyEmail', dashboard.userDevices);
router.put('/editDevice/:deviceId', dashboard.editDevice);
router.put('/companyDetails/:UserId', dashboard.companyDetails);
router.put('/personalDetails/:UserId', dashboard.personalDetails);
router.put('/updatePassword/:UserId', dashboard.updatePassword);
router.put('/editDeviceTrigger/:deviceId', dashboard.editDeviceTrigger);
router.get('/device-trigger/:deviceId', dashboard.fetchDeviceTrigger);
router.get('/user-devices-trigger/:CompanyEmail', dashboard.fetchAllDeviceTrigger);
router.get('/data/:deviceId/intervals', dashboard.getDataByTimeInterval);
router.get('/data/:deviceId', dashboard.getDataByCustomDate);
router.get('/dataStatus/:deviceId/intervals', dashboard.getDataByTimeIntervalStatus);
router.get('/dataStatus/:deviceId', dashboard.getDataByCustomDateStatus);
router.get('/live-device-detail/:deviceId', dashboard.getDeviceDetails);
router.get('/live-device-status/:deviceId', dashboard.getLiveStatusDetails);
router.get('/user-data/:userId', dashboard.getUserData);
router.post('/new-message', dashboard.insertNewMessage);
router.put('/mark-read-message/:messageId', dashboard.markMessageAsRead);
router.delete('/delete-message/:messageId', dashboard.deleteMessage);
router.get('/unread-message/:receiver', dashboard.countUnreadMessages);
router.get('/messages/:receiver', dashboard.getUserMessages);
router.get('/Company-users/:CompanyEmail', dashboard.fetchCompanyUser);
router.post('/addDeviceTrigger', dashboard.addDeviceTrigger);
router.post('/addDevice', dashboard.addDevice);
router.post('/barChartCustom', dashboard.barChartCustom);
router.get('/Total-Volume-Today/:deviceId', dashboard.getTotalVolumeForToday);
router.get('/Total-Volume-Month/:deviceId', dashboard.getTotalVolumeForMonth);
router.get('/Total-Volume-Today-Email/:CompanyEmail', dashboard.getTotalVolumeForTodayEmail);
router.get('/Total-Volume-Month-Email/:CompanyEmail', dashboard.getTotalVolumeForMonthEmail);
router.get('/ConsuptionByIntervalBar/:deviceId', dashboard.getTotalVolumeForDuration);
router.get('/ConsuptionByCustomBar/:deviceId/:startDate/:endDate', dashboard.getWaterConsumptionForDateRange);
router.get('/fetchLatestEntry/:companyEmail', dashboard.fetchLatestEntry);
router.delete('/delete-device/:deviceUID', dashboard.deleteDevice);
router.put('/edit-User/:userId', dashboard.editUser);
router.get('/avginterval/:id/:interval', dashboard.avg_interval);
router.get('/FetchTodayConsumption/:deviceId', dashboard.fetchDeviceTotal);
router.put('/editDeviceFromSetting/:deviceId', dashboard.editDeviceFromSetting);
router.get('/getTriggerDataForAlert/:CompanyEmail', dashboard.getTriggerData);
router.put('/updateTrigger/:DeviceUID', dashboard.updateTrigger);
router.delete('/deletetrigger/:DeviceUID', dashboard.deletetriggeruser);
router.put('/UpdateWhatsapp/:DeviceUID', dashboard.UpdateWhatsapp);
router.put('/UpdateMail/:DeviceUID', dashboard.UpdateMail);
router.get('/lastalerts/:DeviceUID', dashboard.last5alerts);

// Superadmin routes

router.get('/getDeviceByUID/:deviceUID', SA.getDeviceByUID);
router.get('/userByCompanyname/:company_name', SA.userByCompanyname);
router.put('/updateDevice/:deviceUID', SA.updateDevice);
router.delete('/deleteDevice/:deviceUID', SA.deleteDevice);
router.get('/fetchCompanyDetails/:CompanyEmail', SA.fetchCompanyDetails);
router.get('/fetchCounts/:CompanyEmail', SA.fetchCounts);
router.delete('/removeUser/:userId', SA.removeUser);
router.get('/usermanagement', SA.usermanagement);
router.get('/userInfo', SA.userInfo);
router.get('/devInfo', SA.deviceInfo);
router.get('/compInfo', SA.companyinfo);

// Alert routes
router.get('/forAlertData', alert.fetchLatestEntry);
router.get('/forAlertSend', alert.fetchLastSendMsgTime);


//newSa
router.get('/fetchAllDevices', newSa.fetchAllDevices);
router.get('/fetchAllUsers', newSa.fetchAllUsers);
router.get('/countTotalDevices', newSa.countTotalDevices);
router.get('/countDevicesByCompanyEmail', newSa.countDevicesByCompanyEmail);
router.get('/countTotalUsers', newSa.countTotalUsers);
router.get('/countUsersByCompany', newSa.countUsersByCompany);
router.get('/countUserStatuses', newSa.countUserStatuses);
router.get('/fetchAllCounts', newSa.fetchAllCounts);

router.get('/getCountsDataForCharts/intervals', newSa.getDataByTimeInterval);
router.get('/fetchAllCompanies', newSa.fetchAllCompanies);
router.get('/fetchDeviceData/:deviceUID', newSa.fetchDeviceData);
router.get('/fetchLatestDeviceData/:deviceUID', newSa.fetchLatestDeviceData);
module.exports = router;
