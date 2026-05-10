const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const {
  createDepartment,
  getAllDepartments,
  addSubDepartment,
  getDepartmentById,
} = require("../Controllers/dashboardController");

router.post("/create", authAdmin, createDepartment);
router.post("/add-sub-department/:departmentId", authAdmin, addSubDepartment);
router.get("/all", authAdmin, getAllDepartments);
router.get("/:id", authAdmin, getDepartmentById);

module.exports = router;
