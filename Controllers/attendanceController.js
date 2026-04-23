// controllers/attendanceController.js

const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// ======================
// CALCULATE DISTANCE
// ======================
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;

  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ======================
// CHECK IN
// ======================
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { latitude, longitude } = req.body;

    const employee = await Employee.findById(employeeId).populate("admin");

    if (!employee || !employee.admin) {
      return res.status(400).json({
        message: "لا يوجد أدمن مرتبط",
      });
    }

    const company = employee.admin.companyLocation;

    if (!company) {
      return res.status(400).json({
        message: "لم يتم تحديد موقع الشركة بعد",
      });
    }

    const distance = getDistance(
      latitude,
      longitude,
      company.latitude,
      company.longitude,
    );

    if (distance > employee.admin.maxDistance) {
      return res.status(403).json({
        message: "أنت خارج نطاق الشركة",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      employee: employeeId,
      "checkIn.time": { $gte: startOfDay },
    });

    if (existing) {
      return res.status(400).json({
        message: "تم تسجيل الحضور مسبقاً اليوم",
      });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      checkIn: {
        time: new Date(),
        location: { latitude, longitude },
      },
    });

    res.status(201).json({
      message: "تم تسجيل الحضور بنجاح",
      attendance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================
// CHECK OUT
// ======================
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { latitude, longitude } = req.body;

    const employee = await Employee.findById(employeeId).populate("admin");

    const company = employee.admin.companyLocation;

    const distance = getDistance(
      latitude,
      longitude,
      company.latitude,
      company.longitude,
    );

    if (distance > employee.admin.maxDistance) {
      return res.status(403).json({
        message: "أنت خارج نطاق الشركة",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      "checkIn.time": { $gte: startOfDay },
    });

    if (!attendance) {
      return res.status(400).json({
        message: "لم يتم تسجيل الحضور اليوم",
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({
        message: "تم تسجيل الانصراف مسبقاً",
      });
    }

    attendance.checkOut = {
      time: new Date(),
      location: { latitude, longitude },
    };

    await attendance.save();

    res.json({
      message: "تم تسجيل الانصراف بنجاح",
      attendance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
