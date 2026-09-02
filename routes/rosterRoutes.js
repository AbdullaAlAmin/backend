const express = require("express");
const rosters = require("../data/rosters");

const router = express.Router();

//Get the rosters
router.get("/", (req, res) => {
    res.json(rosters);
});

//Get all rosters for a staff member
router.get("/staff/:staffId", (req, res) => {
    const staffId = parseInt(req.params.staffId);

    const staffRosters = rosters.filter(r => r.staffId === staffId);

    res.json(staffRosters);
});

//Get a staff's roster
router.get("/:id", (req, res) => {
    const rosterId = parseInt(req.params.id);
    const member = rosters.find(r => r.rosterId === rosterId);

    if(!member){
        return res.status(404).json({
            message: "Member not found"
        })
    }

    res.json(member);
})


//Roster validation
router.post("/validate", (req, res) => {
    const {staffId, date, time} = req.body;

    if(!staffId || !date || !time) {
        return res.status(400).json({
            message: "Staff Id, date and time are required"
        });
    }

    const staffRosters = rosters.filter( r => r.staffId === parseInt(staffId) && r.date === date);

    if(staffRosters.length === 0) {
        return res.json({
            valid: false,
            message: "Staff member is not rostered on this date"
        });
    }

    const attemptedTime = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
    const validRoster = staffRosters.find(roster => {
            const startTime = parseInt(roster.startTime.split(":")[0]) * 60
            + parseInt(roster.startTime.split(":")[1]);

            const endTime = startTime + (roster.hours * 60);

            return attemptedTime >= startTime && attemptedTime <= endTime;
    });

    if (!validRoster) {
            return res.json({
                valid: false,
                message: "Clock-in time is outside the rostered hours"
            });
        }

        res.json({
            valid: true,
            message: "Staff member is rostered",
            roster: validRoster
        });
});

//Create a roster
router.post("/", (req, res) => {
    const newRoster = req.body;

    if(!newRoster.rosterId ||
        !newRoster.staffId ||
        !newRoster.date ||
        !newRoster.startTime ||
        !newRoster.hours){
            return res.status(400).json({
                message: "Missing required roster information"
            });
    }
    const existingRoster = rosters.find(r => r.rosterId === newRoster.rosterId);

    if(existingRoster){
        return res.status(409).json({
            message: "Roster ID already exists"
        });
    }

    rosters.push(newRoster);
    res.status(201).json(newRoster);
});

//update roster
router.put("/:id", (req, res) => {
    const rosterId = parseInt(req.params.id);

    const roster = rosters.find(r => r.rosterId === rosterId);

    if(!roster) {
        return res.status(404).json({
            message: "Roster not found"
        });
    }

    const updatedRoster = req.body;

    roster.staffId = updatedRoster.staffId ?? roster.staffId;
    roster.date = updatedRoster.date ?? roster.date;
    roster.startTime = updatedRoster.startTime ?? roster.startTime;
    roster.hours = updatedRoster.hours ?? roster.hours;

    res.json(roster);

})

//Delete a roster
router.delete("/:id", (req, res) => {
    const rosterId = parseInt(req.params.id);

    const index = rosters.findIndex(r => r.rosterId === rosterId);

    if(index === -1){
        return res.status(404).json({
            message: "Roster not found"
        });
    }

    const deleteRoster = rosters.splice(index, 1);

    res.json({
        message: "Roster deleted succesfully",
        roster: deleteRoster[0]
    });
});

module.exports = router;