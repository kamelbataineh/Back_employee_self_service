const express = require("express");
const router = express.Router();

const {
  searchPlaces,
  getPlaceDetails,
  getPlaceTime,
} = require("../Controllers/placesController");

router.get("/search", searchPlaces);
router.get("/details", getPlaceDetails);
router.get("/time", getPlaceTime);
module.exports = router;
