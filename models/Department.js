const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  age: Number,
  employeeId: { type: String, required: true },
  role: String,
  password: { type: String, required: true },
});

const subDepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employees: { type: [employeeSchema], default: [] }, 
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subDepartments: { type: [subDepartmentSchema], default: [] },
});

module.exports = mongoose.model("Department", departmentSchema);
