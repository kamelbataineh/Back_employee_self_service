// models\Employee.js


const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  age: Number,
  employeeId: { type: String, required: true },
  role: String,
  password: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
