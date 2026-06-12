// routes/adminRouter.js
const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  setCompanyLocation,
  getCompanyLocation,
  getEmployeeAttendance,
  getCompanyTimezone,
  setCompanyTimezone,
  saveCompanyPlace,
  setWorkSchedule,
  getWorkSchedule,
} = require("../Controllers/adminController");
const auth = require("../middleware/authAdmin");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/set-location", auth, setCompanyLocation);
router.get("/company-location", auth, getCompanyLocation);
router.get("/employee-attendance", auth, getEmployeeAttendance);
router.post("/timezone", auth, setCompanyTimezone);
router.get("/timezone", auth, getCompanyTimezone);
router.post("/work-schedule", auth, setWorkSchedule);
router.get("/work-schedule", auth, getWorkSchedule);
router.post("/company-place", auth, saveCompanyPlace);
router.get("/me", auth, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select("-password");
  res.json(admin);
});

module.exports = router;
