const mongoose = require("mongoose");
const { employeeSchema } = require("./Employee");

const subDepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employees: {
    type: [employeeSchema], 
    default: [],
  },
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subDepartments: {
    type: [subDepartmentSchema],
    default: [],
  },
});

module.exports = mongoose.model("Department", departmentSchema);