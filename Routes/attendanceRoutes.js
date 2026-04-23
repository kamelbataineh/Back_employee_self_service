const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
} = require("../Controllers/attendanceController");

router.post("/check-in", checkIn);

router.post("/check-out", checkOut);

module.exports = router;