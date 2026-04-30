const express = require("express");
const router = express.Router();

const auth = require("../middleware/authAdmin");

const {
  checkAttendanceLocation,
} = require("../Controllers/attendanceController");

router.post("/check", auth, checkAttendanceLocation);

module.exports = router;
