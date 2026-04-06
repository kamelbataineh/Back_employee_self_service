const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getAllDepartments,
} = require("../Controllers/dashboardController");
const authAdmin = require("../middleware/authAdmin");

router.post("/create", authAdmin, createDepartment);
router.get("/all", authAdmin, getAllDepartments);

module.exports = router;
