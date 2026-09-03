const express = require("express");
const staff = require("../data/staff");
const attendance = require("../data/attendance");

const router = express.Router();

router.get("/:staffId", (req, res) => {
    const staffId = parseInt(req.params.staffId);

    // Find staff member
    const member = staff.find(s => s.staffId === staffId);

    if (!member) {
        return res.status(404).json({
            message: "Staff member not found"
        });
    }

    // Find completed attendance records
    const staffAttendance = attendance.filter(
        a => a.staffId === staffId && a.clockOutTime
    );

    if (staffAttendance.length === 0) {
        return res.json({
            staffId: staffId,
            message: "No completed attendance records found",
            totalHours: 0,
            totalPay: 0
        });
    }

    let totalHours = 0;

    // Calculate payable hours
    staffAttendance.forEach(record => {
        let workedHours = record.workedHours || 0;

        // Subtract breaks
        const breakHours = record.breaks.reduce(
            (total, breakRecord) => total + breakRecord.durationHours,
            0
        );

        workedHours -= breakHours;

        // Prevent negative hours
        if (workedHours < 0) {
            workedHours = 0;
        }

        totalHours += workedHours;
    });

    // Calculate standard and overtime hours
    const standardHours = Math.min(
        totalHours,
        member.standardHours
    );

    const overtimeHours = Math.max(
        totalHours - member.standardHours,
        0
    );

    // Calculate pay
    const standardPay = standardHours * member.standardRate;
    const overtimePay = overtimeHours * member.overtimeRate;

    const totalPay = standardPay + overtimePay;

    res.json({
        staffId: staffId,
        staffName: member.name,
        totalHours: parseFloat(totalHours.toFixed(2)),
        standardHours: parseFloat(standardHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        standardPay: parseFloat(standardPay.toFixed(2)),
        overtimePay: parseFloat(overtimePay.toFixed(2)),
        totalPay: parseFloat(totalPay.toFixed(2))
    });
});

module.exports = router;