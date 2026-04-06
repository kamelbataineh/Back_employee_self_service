// Routes\apiRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("API Working");
});

module.exports = router;
