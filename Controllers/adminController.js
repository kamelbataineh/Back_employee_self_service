// Controllers\adminController.js
const Admin = require("../models/Admin");
const CompanyZone = require("../models/CompanyZone");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const Department = require("../models/Department");
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
// ======================
// SET COMPANY LOCATION 📍
// ======================
exports.setCompanyLocation = async (req, res) => {
  try {
    const adminId = req.user.adminId;

    const { latitude, longitude, maxDistance } = req.body;

    // ✅ تعريف المتغير أولاً
    let distanceInMeters = Number(maxDistance || 0.25);

    // 🔽 حدود الأمان
    if (distanceInMeters < 0.25) distanceInMeters = 0.25;
    if (distanceInMeters > 1000) distanceInMeters = 1000;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.companyLocation = {
      latitude,
      longitude,
    };

    admin.maxDistance = distanceInMeters;

    await admin.save();

    return res.json({
      message: "✔ تم حفظ الموقع بنجاح",
      companyLocation: admin.companyLocation,
      maxDistance: admin.maxDistance,
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
// GET COMPANY LOCATION
// ======================
exports.getCompanyLocation = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const adminId = req.user.adminId;

    const admin = await Admin.findById(adminId).select(
      "companyLocation maxDistance",
    );

    if (!admin || !admin.companyLocation) {
      return res.status(404).json({
        message: "لم يتم تحديد موقع الشركة بعد",
      });
    }

    res.json({
      companyLocation: admin.companyLocation,
      maxDistance: admin.maxDistance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







exports.getEmployeeAttendance = async (req, res) => {
  try {
    console.log("🔥 GET EMPLOYEE ATTENDANCE HIT");
    console.log("ADMIN ID:", req.user.adminId);

    const adminId = req.user.adminId;

    const departments = await Department.find({ adminId });

    console.log("📦 Departments found:", departments.length);

    let employees = [];

    departments.forEach((dept) => {
      dept.subDepartments.forEach((sub) => {
        sub.employees.forEach((emp) => {
          employees.push(emp);
        });
      });
    });

    console.log("👥 Total employees:", employees.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("📅 Today from:", today);

    const attendanceToday = await Attendance.find({
      createdAt: { $gte: today },
      status: "checked-in"
    });

    console.log("✅ Attendance records:", attendanceToday.length);

    const presentIds = new Set(
      attendanceToday.map((a) => a.employee.toString())
    );

    let present = 0;
    let absent = 0;

    const result = employees.map((emp) => {
      const isPresent = presentIds.has(emp._id.toString());

      if (isPresent) present++;
      else absent++;

      return {
        id: emp._id,
        name: emp.name?.en,
        employeeId: emp.employeeId,
        status: isPresent ? "present" : "absent",
      };
    });

    console.log("📊 FINAL RESULT SENT");

    res.json({
      totalEmployees: employees.length,
      present,
      absent,
      employees: result,
    });

  } catch (err) {
    console.log("❌ DASHBOARD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};