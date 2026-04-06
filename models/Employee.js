// models\Employee.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeSchema = new Schema(
  {
    employeeId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    age: { type: Number },
    role: { type: String, default: "Employee" },
    password: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    subDepartmentName: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", employeeSchema);
