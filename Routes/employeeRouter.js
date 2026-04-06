const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getEmployeesByDepartment,
  getEmployeesCount,
  getEmployeeById,
} = require("../Controllers/employeeController");
const authAdmin = require("../middleware/authAdmin");

router.post("/create", authAdmin, createEmployee);

router.get("/employees/department/:departmentId", getEmployeesByDepartment);
router.get("/employees/count/all", getEmployeesCount);

router.get("/employees/:id", getEmployeeById);

module.exports = router;
