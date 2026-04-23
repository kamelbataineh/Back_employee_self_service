const Admin = require("../models/Admin");
const CompanyZone = require("../models/CompanyZone");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================
// REGISTER
// ======================
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "الإيميل موجود مسبقاً" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      adminId: admin._id,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================
// LOGIN
// ======================
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "الإيميل غير موجود" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "كلمة السر خاطئة" });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      hasLocation: !!admin.companyLocation,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================
// SET COMPANY LOCATION
// ======================
exports.setCompanyLocation = async (req, res) => {
  try {
    // 🔴 حماية من الخطأ
    if (!req.user || !req.user.adminId) {
      return res.status(401).json({
        message: "Unauthorized - token مشكلة",
      });
    }

    const adminId = req.user.adminId;

    const { latitude, longitude, maxDistance } = req.body;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.companyLocation = {
      latitude,
      longitude,
    };

    admin.maxDistance = maxDistance || 100;

    await admin.save();

    res.json({
      message: "تم حفظ موقع الشركة ✔",
      admin,
    });
  } catch (err) {
    console.error("SET LOCATION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================
// SAVE ZONE (POLYGON)
// ======================
exports.saveZone = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const { polygon, center, radius } = req.body;

    await CompanyZone.deleteMany({ adminId });

    const zone = await CompanyZone.create({
      adminId,
      polygon,
      center,
      radius,
    });

    res.json({ message: "Zone saved", zone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Zone
exports.getZone = async (req, res) => {
  const zone = await CompanyZone.findOne({ adminId: req.user.adminId });
  res.json(zone);
};

// ======================
// GET ZONE
// ======================
