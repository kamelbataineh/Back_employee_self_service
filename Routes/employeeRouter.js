const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const {
  getEmployeesBySubDepartment,
  addEmployeeToSub,
  getEmployeeById,
  employeeLogin,
} = require("../Controllers/employeeController");

router.post("/login", employeeLogin);
router.post("/add-to-sub", authAdmin, addEmployeeToSub);
router.get("/employees/:deptId/:subId", authAdmin, getEmployeesBySubDepartment);
router.get("/:id", authAdmin, getEmployeeById);
module.exports = router;
