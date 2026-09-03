const express = require("express");
const attendance = require("../data/attendance");
const rosters = require("../data/rosters");

const router = express.Router();

//Get all attendance
router.get("/", (req, res) => {
    res.json(attendance);
});

//clock-in
router.post("/clock-in", (req, res) => {
    const {staffId, date, time} = req.body;

    if(!staffId || !date || !time) {
        return res.status(400).json({
            message: "Staff ID, date and time are required"
        });
    }

    //check roster validation
    const rostered = rosters.find( r=> r.staffId === parseInt(staffId) && r.date === date);

    if(!rostered) {
        return res.status(403).json({
            message: "Staff member is not rostered on this date"
        });
    }

    //check if already clocked in
    const alreadyClockedIn = attendance.find(a =>
                a.staffId === parseInt(staffId) &&
                a.date === date &&
                !a.clockOutTime);

    if (alreadyClockedIn) {
        return res.status(409).json({
           message: "Staff member is already clocked in"
        });
    }

    // Create attendance record
    const newAttendance = {
         attendanceId: attendance.length + 1,
         staffId: parseInt(staffId),
         date: date,
         clockInTime: time,
         clockOutTime: null,
         breaks: []
    };

    attendance.push(newAttendance);

    res.status(201).json(newAttendance);

});

//clock-out
router.post("/clock-out", (req, res) => {
    const { staffId, date, time } = req.body;

    if (!staffId || !date || !time) {
        return res.status(400).json({
            message: "Staff ID, date and time are required"
        });
    }

    // Find the attendance record
    const record = attendance.find(
        a =>
            a.staffId === parseInt(staffId) &&
            a.date === date &&
            !a.clockOutTime
    );

    // No active clock-in
    if (!record) {
        return res.status(404).json({
            message: "No active clock-in found for this staff member"
        });
    }

    // Record clock-out
    record.clockOutTime = time;

    // Convert to minutes
    const clockInMinutes =
        parseInt(record.clockInTime.split(":")[0]) * 60 +
        parseInt(record.clockInTime.split(":")[1]);

    const clockOutMinutes =
        parseInt(time.split(":")[0]) * 60 +
        parseInt(time.split(":")[1]);

    // Clock-out must be after clock-in
    if (clockOutMinutes <= clockInMinutes) {
        return res.status(400).json({
            message: "Clock-out time must be after clock-in time"
        });
    }

    // Record clock-out
    record.clockOutTime = time;

    // Total worked hours
    const workedMinutes = clockOutMinutes - clockInMinutes;
    record.workedHours = workedMinutes / 60;

    res.json({
        message: "Staff member clocked out successfully",
        attendance: record
    });
});

//Record Breaks
router.post("/:attendanceId/breaks", (req, res) => {
    const attendanceId = parseInt(req.params.attendanceId);
    const { startTime, endTime, reason } = req.body;

    // Check required information
    if (!startTime || !endTime || !reason) {
        return res.status(400).json({
            message: "Start time, end time and reason are required"
        });
    }

    // Find attendance record
    const record = attendance.find(
        a => a.attendanceId === attendanceId
    );

    if (!record) {
        return res.status(404).json({
            message: "Attendance record not found"
        });
    }

    // Convert to minutes
    const startMinutes =
        parseInt(startTime.split(":")[0]) * 60 +
        parseInt(startTime.split(":")[1]);

    const endMinutes =
        parseInt(endTime.split(":")[0]) * 60 +
        parseInt(endTime.split(":")[1]);

    // Make sure end time is after start time
    if (endMinutes <= startMinutes) {
        return res.status(400).json({
            message: "Break end time must be after start time"
        });
    }

    // Make sure break is within the work period
    const clockInMinutes =
        parseInt(record.clockInTime.split(":")[0]) * 60 +
        parseInt(record.clockInTime.split(":")[1]);

    if (startMinutes < clockInMinutes) {
        return res.status(400).json({
            message: "Break cannot start before clock-in time"
        });
    }

    if (record.clockOutTime) {
        const clockOutMinutes =
            parseInt(record.clockOutTime.split(":")[0]) * 60 +
            parseInt(record.clockOutTime.split(":")[1]);

        if (endMinutes > clockOutMinutes) {
            return res.status(400).json({
                message: "Break cannot end after clock-out time"
            });
        }
    }

    // Make sure the break does not overlap an existing break
    const overlappingBreak = record.breaks.find(existingBreak => {
        const existingStart =
            parseInt(existingBreak.startTime.split(":")[0]) * 60 +
            parseInt(existingBreak.startTime.split(":")[1]);

        const existingEnd =
            parseInt(existingBreak.endTime.split(":")[0]) * 60 +
            parseInt(existingBreak.endTime.split(":")[1]);

        return startMinutes < existingEnd && endMinutes > existingStart;
    });

    if (overlappingBreak) {
        return res.status(409).json({
            message: "Break overlaps with an existing break"
        });
    }

    // Calculate break duration
    const durationMinutes = endMinutes - startMinutes;
    const durationHours = durationMinutes / 60;

    const newBreak = {
        breakId: record.breaks.length + 1,
        startTime: startTime,
        endTime: endTime,
        reason: reason,
        durationHours: durationHours
    };

    record.breaks.push(newBreak);

    res.status(201).json({
        message: "Break recorded successfully",
        break: newBreak,
        attendance: record
    });
});

module.exports = router;