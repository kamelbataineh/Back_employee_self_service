// controllers/adminController.js

const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

///////////////////////
////
////
///////////////////////
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "الإيميل موجود مسبقاً" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();

    return res
      .status(201)
      .json({ message: "تم إنشاء الحساب بنجاح", adminId: admin._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ داخلي" });
  }
};

///////////////////////
////
////
///////////////////////

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "الإيميل غير موجود" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "كلمة السر خاطئة" });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({ message: "تم تسجيل الدخول بنجاح", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ داخلي" });
  }
};
