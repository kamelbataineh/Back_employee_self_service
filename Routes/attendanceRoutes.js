const express = require("express");
const router = express.Router();

const auth = require("../middleware/authAdmin");
const {
  checkIn,
  checkOut,
  getMyMonthlyStats,
  getMyMonthlyDays,
  getMyYearlyChart,
  getEmployeeMonthlyDays,
  hasCheckedInToday,
} = require("../Controllers/attendanceController");

router.post("/check-in", auth, checkIn);
router.post("/check-out", auth, checkOut);
router.get("/checkin/today", auth, hasCheckedInToday);
router.get("/stats/month", auth, getMyMonthlyStats);
router.get("/stats/year", auth, getMyYearlyChart);
router.get("/stats/month-days", auth, getMyMonthlyDays);
router.get("/admin/month-days", auth, getEmployeeMonthlyDays);
module.exports = router; //
