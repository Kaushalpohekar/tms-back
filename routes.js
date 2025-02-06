const express = require('express');
const router = express.Router();

const authentication = require('./auth/authentication');
const dashboard = require('./dash/dashboard.js');
const SA = require('./superadmin/SA.js');
const newSa = require('./superadmin/newSa.js');
const alert = require('./dash/alert.js');
const { authenticateUser } = require('./token/jwtUtils');

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
router.get('/userdevices/:companyEmail', authenticateUser, dashboard.userDevices);
router.put('/editDevice/:deviceId', authenticateUser, dashboard.editDevice);
router.put('/companyDetails/:UserId', authenticateUser, dashboard.companyDetails);
router.put('/personalDetails/:UserId', authenticateUser, dashboard.personalDetails);
router.put('/updatePassword/:UserId', authenticateUser, dashboard.updatePassword);
router.put('/editDeviceTrigger/:deviceId', authenticateUser, dashboard.editDeviceTrigger);
router.get('/device-trigger/:deviceId', authenticateUser, dashboard.fetchDeviceTrigger);
router.get('/user-devices-trigger/:CompanyEmail', authenticateUser, dashboard.fetchAllDeviceTrigger);
router.get('/data/:deviceId/intervals', authenticateUser, dashboard.getDataByTimeInterval);
router.get('/data/:deviceId', authenticateUser, dashboard.getDataByCustomDate);
router.get('/dataStatus/:deviceId/intervals', authenticateUser, dashboard.getDataByTimeIntervalStatus);
router.get('/dataStatus/:deviceId', authenticateUser, dashboard.getDataByCustomDateStatus);
router.get('/live-device-detail/:deviceId', authenticateUser, dashboard.getDeviceDetails);
router.get('/live-device-status/:deviceId', authenticateUser, dashboard.getLiveStatusDetails);
router.get('/user-data/:userId', authenticateUser, dashboard.getUserData);
router.post('/new-message', authenticateUser, dashboard.insertNewMessage);
router.put('/mark-read-message/:messageId', authenticateUser, dashboard.markMessageAsRead);
router.delete('/delete-message/:messageId', authenticateUser, dashboard.deleteMessage);
router.get('/unread-message/:receiver', authenticateUser, dashboard.countUnreadMessages);
router.get('/messages/:receiver', authenticateUser, dashboard.getUserMessages);
router.get('/Company-users/:CompanyEmail', authenticateUser, dashboard.fetchCompanyUser);
router.post('/addDeviceTrigger', authenticateUser, dashboard.addDeviceTrigger);
router.post('/addDevice', authenticateUser, dashboard.addDevice);
router.post('/barChartCustom', authenticateUser, dashboard.barChartCustom);
router.get('/Total-Volume-Today/:deviceId', authenticateUser, dashboard.getTotalVolumeForToday);
router.get('/Total-Volume-Month/:deviceId', authenticateUser, dashboard.getTotalVolumeForMonth);
router.get('/Total-Volume-Today-Email/:CompanyEmail', authenticateUser, dashboard.getTotalVolumeForTodayEmail);
router.get('/Total-Volume-Month-Email/:CompanyEmail', authenticateUser, dashboard.getTotalVolumeForMonthEmail);
router.get('/ConsuptionByIntervalBar/:deviceId', authenticateUser, dashboard.getTotalVolumeForDuration);
router.get('/ConsuptionByCustomBar/:deviceId/:startDate/:endDate', authenticateUser, dashboard.getWaterConsumptionForDateRange);
router.get('/fetchLatestEntry/:companyEmail', authenticateUser, dashboard.fetchLatestEntry);
router.delete('/delete-device/:deviceUID', authenticateUser, dashboard.deleteDevice);
router.put('/edit-User/:userId', authenticateUser, dashboard.editUser);
router.get('/avginterval/:id/:interval', authenticateUser, dashboard.avg_interval);
router.get('/FetchTodayConsumption/:deviceId', authenticateUser, dashboard.fetchDeviceTotal);
router.put('/editDeviceFromSetting/:deviceId', authenticateUser, dashboard.editDeviceFromSetting);
router.get('/getTriggerDataForAlert/:CompanyEmail', authenticateUser, dashboard.getTriggerData);
router.put('/updateTrigger/:DeviceUID', authenticateUser, dashboard.updateTrigger);
router.delete('/deletetrigger/:DeviceUID', authenticateUser, dashboard.deletetriggeruser);
router.put('/UpdateWhatsapp/:DeviceUID', authenticateUser, dashboard.UpdateWhatsapp);
router.put('/UpdateMail/:DeviceUID', authenticateUser, dashboard.UpdateMail);
router.get('/lastalerts/:DeviceUID', authenticateUser,  dashboard.last5alerts);

// Superadmin routes

router.get('/getDeviceByUID/:deviceUID', authenticateUser, SA.getDeviceByUID);
router.get('/userByCompanyname/:company_name', authenticateUser, SA.userByCompanyname);
router.put('/updateDevice/:deviceUID', authenticateUser, SA.updateDevice);
router.delete('/deleteDevice/:deviceUID', authenticateUser, SA.deleteDevice);
router.get('/fetchCompanyDetails/:CompanyEmail', authenticateUser, SA.fetchCompanyDetails);
router.get('/fetchCounts/:CompanyEmail', authenticateUser, SA.fetchCounts);
router.delete('/removeUser/:userId', authenticateUser, SA.removeUser);
router.get('/usermanagement', authenticateUser, SA.usermanagement);
router.get('/userInfo', authenticateUser, SA.userInfo);
router.get('/devInfo', authenticateUser, SA.deviceInfo);
router.get('/compInfo', authenticateUser, SA.companyinfo);


//newSa
router.get('/fetchAllDevices', authenticateUser, newSa.fetchAllDevices);
router.get('/fetchAllUsers', authenticateUser, newSa.fetchAllUsers);
router.get('/countTotalDevices', authenticateUser, newSa.countTotalDevices);
router.get('/countDevicesByCompanyEmail', authenticateUser,  newSa.countDevicesByCompanyEmail);
router.get('/countTotalUsers', authenticateUser, newSa.countTotalUsers);
router.get('/countUsersByCompany', authenticateUser, newSa.countUsersByCompany);
router.get('/countUserStatuses', authenticateUser, newSa.countUserStatuses);
router.get('/fetchAllCounts', authenticateUser, newSa.fetchAllCounts);

router.get('/getCountsDataForCharts/intervals', authenticateUser, newSa.getDataByTimeInterval);
router.get('/fetchAllCompanies', authenticateUser, newSa.fetchAllCompanies);
router.get('/fetchDeviceData/:deviceUID', authenticateUser, newSa.fetchDeviceData);
router.get('/fetchLatestDeviceData/:deviceUID', authenticateUser, newSa.fetchLatestDeviceData);
router.get('/fetchLatestEntryAllDevices', authenticateUser, newSa.fetchLatestEntryAllDevices);
module.exports = router;
