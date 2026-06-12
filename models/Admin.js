const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  companyLocation: {
    latitude: Number,
    longitude: Number,
  },

  maxDistance: {
    type: Number,
    default: 100,
  },

  companyTimezone: {
    type: String,
    default: "Asia/Amman",
  },

  workSchedule: {
    startTime: {
      type: String,
      default: "09:00",
    },

    endTime: {
      type: String,
      default: "17:00",
    },

    lateAfterMinutes: {
      type: Number,
      default: 10,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
