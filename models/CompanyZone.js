const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
  polygon: [
    {
      lat: Number,
      lng: Number,
    },
  ],
});

module.exports = mongoose.model("CompanyZone", zoneSchema);