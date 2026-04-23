const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
      fr: { type: String, default: "" },
    },

    phone: String,
    age: Number,

    employeeId: {
      type: String,
      required: true,
      unique: true,
    },

    role: String,

    password: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    workLocation: {
      latitude: Number,
      longitude: Number,
    },

    shift: {
      startTime: String,
      endTime: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);