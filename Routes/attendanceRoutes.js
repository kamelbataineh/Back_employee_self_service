const express = require("express");
const router = express.Router();

const auth = require("../middleware/authAdmin");
const { checkIn,getMyMonthlyStats,getMyMonthlyDays,getMyYearlyChart } = require("../Controllers/attendanceController");

router.post("/check-in", auth, checkIn);
router.get("/stats/month", auth, getMyMonthlyStats);
router.get("/stats/year", auth, getMyYearlyChart);
router.get("/stats/month-days", auth,getMyMonthlyDays);
module.exports = router;//