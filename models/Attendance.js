const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    checkIn: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
      },
      distance: {
        type: Number,
        default: null,
      },
      allowed: {
        type: Boolean,
        default: null,
      },
    },

    checkOut: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
      },
      distance: {
        type: Number,
        default: null,
      },
      allowed: {
        type: Boolean,
        default: null,
      },
    },

    status: {
      type: String,
      enum: ["checked-in", "checked-out", "rejected"],
      default: "checked-in",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
