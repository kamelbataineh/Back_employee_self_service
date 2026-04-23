// models\Department.js

const mongoose = require("mongoose");
const { employeeSchema } = require("./Employee");

const subDepartmentSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    fr: { type: String, default: "" },
  },
  employees: {
    type: [employeeSchema],
    default: [],
  },
});

const departmentSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },

  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    fr: { type: String, default: "" },
  },

  subDepartments: {
    type: [subDepartmentSchema],
    default: [],
  },
});
module.exports = mongoose.model("Department", departmentSchema);
