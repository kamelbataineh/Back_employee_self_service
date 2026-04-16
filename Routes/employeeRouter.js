const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const { verifyToken } = require("../middleware/auth");
const {
  getEmployeesBySubDepartment,
  addEmployeeToSub,
  getEmployeeById,
  getMyProfile,
  loginEmployee,
} = require("../Controllers/employeeController");

router.post("/login", loginEmployee);
router.post("/add-to-sub", authAdmin, addEmployeeToSub);
router.get("/employees/:deptId/:subId", authAdmin, getEmployeesBySubDepartment);
router.get("/me", verifyToken, getMyProfile);
router.get("/:id", authAdmin, getEmployeeById);

module.exports = router;
