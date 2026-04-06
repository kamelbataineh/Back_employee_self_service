const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const {
  registerEmployee,
  getEmployeesBySubDepartment,
  addEmployeeToSub,
} = require("../Controllers/employeeController");

router.post("/register", registerEmployee);
router.post("/add-to-sub", authAdmin, addEmployeeToSub);
router.get("/employees/:deptId/:subId", authAdmin, getEmployeesBySubDepartment);

module.exports = router;
