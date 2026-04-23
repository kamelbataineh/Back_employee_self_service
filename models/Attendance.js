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
    },

    checkOut: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
