const express = require("express");
const router = express.Router();

const auth = require("../middleware/authAdmin");
const { checkIn } = require("../Controllers/attendanceController");

router.post("/check-in", auth, checkIn);

module.exports = router;