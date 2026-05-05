const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const admin = await Admin.findById(employee.admin);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.companyLocation) {
      return res.status(404).json({
        allowed: false,
        message: "Company location not set",
      });
    }

    const distance = haversineDistance(
      admin.companyLocation.latitude,
      admin.companyLocation.longitude,
      latitude,
      longitude
    );

    const allowed = distance <= admin.maxDistance;

    // 🔴 تحديد الحالة
    let status = allowed ? "checked-in" : "rejected";

    // 🟢 حفظ في الداتا بيز
    const attendance = await Attendance.create({
      employee: employee._id,

      checkIn: {
        time: new Date(),
        location: {
          latitude,
          longitude,
        },
        distance,
        allowed,
      },

      status,
    });

    return res.json({
      allowed,
      message: allowed ? "Check-in successful" : "Outside allowed zone",
      distance,
      attendance,
    });

  } catch (err) {
    console.log("ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};