const express = require("express");
const router = express.Router();

const {
  searchPlaces,
  getPlaceDetails,
} = require("../Controllers/placesController");

// ================= ROUTES =================
router.get("/search", searchPlaces);
router.get("/details", getPlaceDetails);

module.exports = router;
