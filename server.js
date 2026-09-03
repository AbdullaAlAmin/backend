const express = require("express");

const staffRoutes = require("./routes/staffRoutes");
const rosterRoutes = require("./routes/rosterRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Farm Time Management API is running"
    });
});

app.get("/api/test", (req, res) =>{
    res.json({
        message: "Backend is working"
    });
});

app.use("/api/staff", staffRoutes);
app.use("/api/rosters", rosterRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});