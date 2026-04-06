// routes/adminRouter.js
const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");
const auth = require("../middleware/authAdmin");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.get("/me", auth, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select("-password");
  res.json(admin);
});

module.exports = router;
