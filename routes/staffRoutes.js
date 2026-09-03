const express = require("express");
const staff = require("../data/staff");

const router = express.Router();

//All staff
router.get("/", (req, res) => {
    res.json(staff);
});

//One staff
router.get("/:id", (req, res) => {
    const staffId = parseInt(req.params.id);

    const member = staff.find( s => s.staffId === staffId);

    if (!member) {
        return res.status(404).json({
            message: "Staff member not found"
        })
    }

    res.json(member);
});

//Create new staff
router.post("/", (req, res) => {
    const newStaff = req.body;

    if(!newStaff.staffId || !newStaff.name || !newStaff.contractType || !newStaff.role) {
        return res.status(400).json({
            message: "Missing required staff information"
        });
    }

    const existingStaff = staff.find(s => s.staffId === newStaff.staffId);

    if(existingStaff) {
        return res.status(409).json({
            message: "Staff ID already exists"
        });
    }

    staff.push(newStaff);

    res.status(201).json(newStaff);
})

//update staff member
router.put("/:id", (req, res) => {
    const staffId = parseInt(req.params.id);

    const member = staff.find(s => s.staffId === staffId);

    if(!member) {
        return res.status(404).json({
            message: "Staff member not found"
        });
    }

    const updatedStaff = req.body;

    member.name = updatedStaff.name ?? member.name;
    member.contractType = updatedStaff.contractType ?? member.contractType;
    member.role = updatedStaff.role ?? member.role;
    member.standardHours = updatedStaff.standardHours ?? member.standardHours;
    member.standardRate = updatedStaff.standardRate ?? member.standardRate;
    member.overtimeRate = updatedStaff.overtimeRate ?? member.overtimeRate;

    res.json(member);

})

//Delete a staff
router.delete("/:id", (req, res) => {
    const staffId = parseInt(req.params.id);

    const index = staff.findIndex(s => s.staffId === staffId);

    if (index === -1) {
        return res.status(404).json({
            message: "Staff member not found"
        });
    }

    const deletedStaff = staff.splice(index, 1);

    res.json({
        message: "Staff member deleted successfully",
        staff: deletedStaff[0]
    });
});

module.exports = router;