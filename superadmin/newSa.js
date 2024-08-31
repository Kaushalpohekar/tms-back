const db = require('../db');

async function fetchAllDevices(req, res) {
    try {
        const query = `
            SELECT d.DeviceUID, d.DeviceLocation, d.DeviceName, d.CompanyName, d.IssueDate, d.status, d.DeviceType, d.CompanyEmail,
                   t.TriggerValue, t.Mail, t.Whatsapp, t.interval, t.ContactNO, t.PersonalEmail
            FROM tms_devices d
            LEFT JOIN tms_trigger t ON d.DeviceUID = t.DeviceUID
        `;

        // Use a promise-based query execution
        const [rows] = await db.promise().query(query);

        if (rows.length === 0) {
            res.status(404).json({ message: 'No devices found' });
            return;
        }

        res.json({ devices: rows });
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function countTotalDevices(res) {
    try {
        const query = 'SELECT COUNT(*) AS totalDevices FROM tms_devices';
        db.query(query, (error, result) => {
            if (error) {
                throw new Error('Error counting devices');
            }
            const totalDevices = result[0].totalDevices;
            res.json({ totalDevices });
            console.log(`Total number of devices: ${totalDevices}`);
        });
    } catch (error) {
        console.error('Error counting devices:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function countDevicesByCompanyEmail(res) {
    try {
        const query = `
        SELECT companyEmail, COUNT(*) AS deviceCount
        FROM tms_devices
        GROUP BY companyEmail
      `;
        db.query(query, (error, rows) => {
            if (error) {
                throw new Error('Error counting devices by company email');
            }
            res.json({ deviceCounts: rows });
            console.log('Device counts by company email:', rows);
        });
    } catch (error) {
        console.error('Error counting devices by company email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function countTotalUsers(res) {
    try {
        const query = 'SELECT COUNT(*) AS totalUsers FROM tms_users';
        db.query(query, (error, result) => {
            if (error) {
                throw new Error('Error counting users');
            }
            const totalUsers = result[0].totalUsers;
            res.json({ totalUsers });
            console.log(`Total number of users: ${totalUsers}`);
        });
    } catch (error) {
        console.error('Error counting users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function countUsersByCompany(res) {
    try {
        const query = `
        SELECT companyName, COUNT(*) AS userCount
        FROM tms_users
        GROUP BY companyName
      `;
        db.query(query, (error, rows) => {
            if (error) {
                throw new Error('Error counting users by company');
            }
            res.json({ userCounts: rows });
            console.log('User counts by company:', rows);
        });
    } catch (error) {
        console.error('Error counting users by company:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function fetchAllUsers(res) {
    try {
        const query = `
        SELECT *
        FROM tms_users
      `;
        db.query(query, (error, rows) => {
            if (error) {
                throw new Error('Error fetching users');
            }
            res.json({ users: rows });
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function countUserStatuses(res) {
    const query = `
      SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN block = 1 THEN 1 ELSE 0 END) AS blockedUsers,
        SUM(CASE WHEN block = 0 THEN 1 ELSE 0 END) AS unblockedUsers,
        SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) AS verifiedUsers,
        SUM(CASE WHEN verified = 0 THEN 1 ELSE 0 END) AS unverifiedUsers,
        SUM(CASE WHEN is_online = 1 THEN 1 ELSE 0 END) AS onlineUsers,
        SUM(CASE WHEN is_online = 0 THEN 1 ELSE 0 END) AS offlineUsers
      FROM tms_users
    `;

    db.query(query, (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (result.length === 0) {
            console.warn('No data found');
            return res.json({
                totalUsers: 0,
                blockedUsers: 0,
                unblockedUsers: 0,
                verifiedUsers: 0,
                unverifiedUsers: 0,
                onlineUsers: 0,
                offlineUsers: 0
            });
        }

        const counts = result[0];
        res.json({
            totalUsers: counts.totalUsers,
            blockedUsers: counts.blockedUsers,
            unblockedUsers: counts.unblockedUsers,
            verifiedUsers: counts.verifiedUsers,
            unverifiedUsers: counts.unverifiedUsers,
            onlineUsers: counts.onlineUsers,
            offlineUsers: counts.offlineUsers
        });

        console.log('User counts:', counts);
    });
}

function fetchAllCounts(req, res) {
    try {
        const query = `
        SELECT * 
        FROM tms_user_device_stats 
        ORDER BY created_at DESC 
        LIMIT 1`;

        db.query(query, (error, rows) => {
            if (error) {
                console.error('Error fetching counts from the database:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // If no rows are returned, handle the case where no data exists
            if (rows.length === 0) {
                return res.status(404).json({ message: 'No data found' });
            }

            res.json({ counts: rows });
        });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

function getDataByTimeInterval(req, res) {
    try {
        const timeInterval = req.query.interval;
        if (!timeInterval) {
            return res.status(400).json({ message: 'Invalid time interval' });
        }

        let sql;
        switch (timeInterval) {
            case '1hour':
                sql = `
          SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / 60) * 60) AS bucket_start_time,
            ROUND(AVG(active_users_count), 1) AS active_users_count,
            ROUND(AVG(inactive_users_count), 1) AS inactive_users_count,
            ROUND(AVG(active_devices_count), 1) AS active_devices_count,
            ROUND(AVG(deactive_devices_count), 1) AS deactive_devices_count
          FROM
            tms_user_device_stats
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
          GROUP BY
            bucket_start_time
          ORDER BY
            bucket_start_time;`;
                break;

            case '12hour':
                sql = `
          SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / (2 * 60)) * (2 * 60)) AS bucket_start_time,
            ROUND(AVG(active_users_count), 1) AS active_users_count,
            ROUND(AVG(inactive_users_count), 1) AS inactive_users_count,
            ROUND(AVG(active_devices_count), 1) AS active_devices_count,
            ROUND(AVG(deactive_devices_count), 1) AS deactive_devices_count
          FROM
            tms_user_device_stats
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
          GROUP BY
            bucket_start_time
          ORDER BY
            bucket_start_time;`;
                break;

            case '1day':
                sql = `
          SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / (2 * 60)) * (2 * 60)) AS bucket_start_time,
            ROUND(AVG(active_users_count), 1) AS active_users_count,
            ROUND(AVG(inactive_users_count), 1) AS inactive_users_count,
            ROUND(AVG(active_devices_count), 1) AS active_devices_count,
            ROUND(AVG(deactive_devices_count), 1) AS deactive_devices_count
          FROM
            tms_user_device_stats
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          GROUP BY
            bucket_start_time
          ORDER BY
            bucket_start_time;`;
                break;

            case '7day':
                sql = `
          SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / (10 * 60)) * (10 * 60)) AS bucket_start_time,
            ROUND(AVG(active_users_count), 1) AS active_users_count,
            ROUND(AVG(inactive_users_count), 1) AS inactive_users_count,
            ROUND(AVG(active_devices_count), 1) AS active_devices_count,
            ROUND(AVG(deactive_devices_count), 1) AS deactive_devices_count
          FROM
            tms_user_device_stats
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY
            bucket_start_time
          ORDER BY
            bucket_start_time;`;
                break;

            case '30day':
                sql = `
          SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / (30 * 60)) * (30 * 60)) AS bucket_start_time,
            ROUND(AVG(active_users_count), 1) AS active_users_count,
            ROUND(AVG(inactive_users_count), 1) AS inactive_users_count,
            ROUND(AVG(active_devices_count), 1) AS active_devices_count,
            ROUND(AVG(deactive_devices_count), 1) AS deactive_devices_count
          FROM
            tms_user_device_stats
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY
            bucket_start_time
          ORDER BY
            bucket_start_time;`;
                break;

            case '6month':
                sql = `
            SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / (60 * 60)) * (60 * 60)) AS bucket_start_time,
            ROUND(AVG(active_users_count), 1) AS active_users_count,
            ROUND(AVG(inactive_users_count), 1) AS inactive_users_count,
            ROUND(AVG(active_devices_count), 1) AS active_devices_count,
            ROUND(AVG(deactive_devices_count), 1) AS deactive_devices_count
          FROM
            tms_user_device_stats
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          GROUP BY
            bucket_start_time
          ORDER BY
            bucket_start_time;`;
                break;

            case '12month':
                sql = `
            SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / (120 * 60)) * (120 * 60)) AS bucket_start_time,
            ROUND(AVG(active_users_count), 1) AS active_users_count,
            ROUND(AVG(inactive_users_count), 1) AS inactive_users_count,
            ROUND(AVG(active_devices_count), 1) AS active_devices_count,
            ROUND(AVG(deactive_devices_count), 1) AS deactive_devices_count
          FROM
            tms_user_device_stats
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY
            bucket_start_time
          ORDER BY
            bucket_start_time;`;
                break;

            default:
                return res.status(400).json({ message: 'Invalid time interval' });
        }

        db.query(sql, (error, results) => {
            if (error) {
                console.error('Error fetching data:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json({ data: results });
        });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


async function fetchAllCompanies(req, res) {
    try {
        const query = `
            SELECT DISTINCT CompanyName, CompanyEmail
            FROM tms_users;
        `;

        // Use a promise-based query execution
        const [rows] = await db.promise().query(query);

        if (rows.length === 0) {
            res.status(404).json({ message: 'No companies found' });
            return;
        }

        res.json({ companies: rows });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function fetchDeviceData(req, res) {
    const { deviceUID } = req.params; // Assuming you send deviceUID as a URL parameter

    try {
        // Query to fetch the primary device data
        const queryPrimary = `
            SELECT
                d.DeviceUID,
                d.DeviceLocation,
                d.DeviceName,
                d.CompanyEmail,
                d.CompanyName,
                d.IssueDate as DeviceIssueDate,
                d.status,
                d.DeviceType,
                t.TriggerValue,
                t.PersonalEmail,
                t.ContactNO,
                s.SimProvider,
                s.SimMobileNo,
                s.IssueDate as SimIssueDate
            FROM
                tms_devices d
            LEFT JOIN
                tms_trigger t ON d.DeviceUID = t.DeviceUID
            LEFT JOIN
                tms_sim_data s ON d.DeviceUID = s.DeviceUID
            WHERE
                d.DeviceUID = ?
        `;
        
        const [primaryRows] = await db.promise().query(queryPrimary, [deviceUID]);

        if (primaryRows.length === 0) {
            res.status(404).json({ message: 'No data found for the specified device' });
            return;
        }

        // Query to fetch the additional data (first entry and total count)
        const queryAdditional = `
            SELECT
                TimeStamp as FirstEntryDate
            FROM
                actual_data
            WHERE
                DeviceUID = ?
            ORDER BY
                TimeStamp ASC
            LIMIT 1
        `;
        
        const [additionalFirstEntry] = await db.promise().query(queryAdditional, [deviceUID]);

        // Query to count total number of entries in tms_additional_data for the device
        const queryCount = `
            SELECT COUNT(*) as TotalCount
            FROM
                actual_data
            WHERE
                DeviceUID = ?
        `;
        
        const [[countResult]] = await db.promise().query(queryCount, [deviceUID]);

        res.json({
            deviceData: primaryRows,
            firstEntry: additionalFirstEntry || null,
            totalCount: countResult.TotalCount
        });
    } catch (error) {
        console.error('Error fetching device data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function fetchLatestDeviceData(req, res) {
    const { deviceUID } = req.params; // Assuming you send deviceUID as a URL parameter

    try {
        // Query to fetch the primary device data
        const queryPrimary = `
            SELECT
                *
            FROM
                actual_data 
            WHERE
                DeviceUID = ?
            ORDER BY Timestamp DESC LIMIT 1;
        `;
        
        const [primaryRows] = await db.promise().query(queryPrimary, [deviceUID]);

        if (primaryRows.length === 0) {
            return res.status(404).json({ message: 'No data found for the specified device' });
        }

        res.json({
            deviceData: primaryRows[0], // Send the first row of the result
        });
    } catch (error) {
        console.error('Error fetching device data:', error.message); // Log error message
        res.status(500).json({ message: 'Internal server error' });
    }
}



module.exports = {
    fetchAllDevices,
    countTotalDevices,
    countDevicesByCompanyEmail,
    countTotalUsers,
    countUsersByCompany,
    fetchAllUsers,
    countUserStatuses,
    fetchAllCounts,
    getDataByTimeInterval,
    fetchAllCompanies,
    fetchDeviceData,
    fetchLatestDeviceData
}