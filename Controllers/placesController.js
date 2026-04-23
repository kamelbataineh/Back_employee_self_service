const axios = require("axios");

const GOOGLE_API_KEY = "AIzaSyAwSsQdhAYpbUkTvdX70s3i_h1UkRGtNd4";

// ================= SEARCH PLACES =================
const searchPlaces = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) return res.json([]);

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_API_KEY}&components=country:jo`;

    const response = await axios.get(url);

    console.log("Google Status:", response.data.status);

    // 🔴 مهم جداً
    if (response.data.status !== "OK") {
      return res.json({
        status: response.data.status,
        predictions: [],
      });
    }

    return res.json({
      status: "OK",
      predictions: response.data.predictions || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "ERROR", predictions: [] });
  }
};

// ================= PLACE DETAILS =================
const getPlaceDetails = async (req, res) => {
  try {
    const placeId = req.query.placeId;

    if (!placeId) {
      return res.status(400).json({ error: "placeId required" });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;

    const response = await axios.get(url);

    console.log("📦 Details Status:", response.data.status);

    if (response.data.status !== "OK") {
      return res.status(400).json({
        status: response.data.status,
        location: null,
      });
    }

    const loc = response.data.result?.geometry?.location;

    console.log("📌 Location:", loc);

    return res.json({
      status: "OK",
      location: loc,
    });
  } catch (error) {
    console.error("❌ Details Error:", error.message);
    res.status(500).json({ error: "Details failed" });
  }
};

module.exports = {
  getPlaceDetails,
  searchPlaces,
};
