DELIMITER $$

CREATE EVENT aggregate_actual_data
ON SCHEDULE EVERY 30 MINUTE
STARTS '2024-12-27 09:06:32'
ON COMPLETION NOT PRESERVE
ENABLE
DO
BEGIN
    START TRANSACTION;
    INSERT INTO clean_data (DeviceUID, TimeStamp , Temperature, Humidity, flowRate, TemperatureR, TemperatureY, TemperatureB, Pressure, totalVolume)
    SELECT
        DeviceUID,
        FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(TimeStamp) / (30 * 60)) * (30 * 60)) AS bucket_start_time,
        ROUND(AVG(Temperature), 1) AS Temperature,
        ROUND(AVG(Humidity), 1) AS Humidity,
        ROUND(AVG(flowRate), 1) AS flowRate,
        ROUND(AVG(TemperatureR), 1) AS TemperatureR,
        ROUND(AVG(TemperatureY), 1) AS TemperatureY,
        ROUND(AVG(TemperatureB), 1) AS TemperatureB,
        ROUND(AVG(Pressure), 1) AS Pressure,
        MAX(totalVolume) AS totalVolume
    FROM
        actual_data
    WHERE
        TimeStamp >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)  -- Only consider last 30 minutes of data
    GROUP BY
        DeviceUID,
        bucket_start_time
    ORDER BY
        DeviceUID,
        bucket_start_time;

    COMMIT;
END$$

DELIMITER ;
