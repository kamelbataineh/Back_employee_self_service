const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    age: Number,
    employeeId: { type: String, required: true, unique: true },
    role: String,
    password: { type: String, required: true },

    email: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", employeeSchema);
module.exports.employeeSchema = employeeSchema;
