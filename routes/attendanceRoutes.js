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
            message: "Staff member is not rostered at this date"
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

    res.json({
        message: "Staff member clocked out successfully",
        attendance: record
    });
});


module.exports = router;