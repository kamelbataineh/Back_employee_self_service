// routes/adminRouter.js
const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  setCompanyLocation,
  getCompanyLocation,
  getEmployeeAttendance
} = require("../Controllers/adminController");
const auth = require("../middleware/authAdmin");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/set-location", auth, setCompanyLocation);
router.get("/company-location", auth, getCompanyLocation);
router.get("/employee-attendance", auth, getEmployeeAttendance);

router.get("/me", auth, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select("-password");
  res.json(admin);
});

module.exports = router;
