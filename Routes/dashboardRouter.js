const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getAllDepartments,
  addSubDepartment,
  getDepartmentById,
  
} = require("../Controllers/dashboardController");
const authAdmin = require("../middleware/authAdmin");

router.post("/create", authAdmin, createDepartment);

router.post("/add-sub-department/:departmentId", authAdmin, addSubDepartment);
router.get("/all", authAdmin, getAllDepartments);


router.get("/:id", authAdmin, getDepartmentById);

module.exports = router;
