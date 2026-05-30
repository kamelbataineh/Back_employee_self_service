const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");

// ======================
// Calculate Distance
// ======================
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;

  const toRad = (v) => {
    return (v * Math.PI) / 180;
  };

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// ======================
// Employee Check In
// ======================
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const admin = await Admin.findById(employee.admin);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
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
      longitude,
    );

    const allowed = distance <= admin.maxDistance;

    let status = allowed ? "checked-in" : "rejected";

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

    return res.status(500).json({
      message: err.message,
    });
  }
};

// ======================
// Employee Check Out
// ======================
exports.checkOut = async (req, res) => {
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

    // 🔴 أهم نقطة: لازم يكون عامل Check-In ومش عامل Check-Out
    const attendance = await Attendance.findOne({
      employee: employeeId,
      status: "checked-in",
      "checkOut.time": null,
    }).sort({ createdAt: -1 });

    if (!attendance) {
      return res.status(400).json({
        message: "No active check-in found. Please check in first.",
        allowed: false,
      });
    }

    const distance = haversineDistance(
      admin.companyLocation.latitude,
      admin.companyLocation.longitude,
      latitude,
      longitude,
    );

    const allowed = distance <= admin.maxDistance;

    attendance.checkOut = {
      time: new Date(),
      location: {
        latitude,
        longitude,
      },
      distance,
      allowed,
    };

    attendance.status = "checked-out";

    await attendance.save();

    return res.json({
      message: "Checked out successfully",
      allowed,
      attendance,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ======================
// Get Monthly Statistics
// ======================
exports.getMyMonthlyStats = async (req, res) => {
  try {
    const empId = req.user.id;

    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "month and year are required",
      });
    }

    const start = new Date(year, month - 1, 1);

    const end = new Date(year, month, 1);

    const records = await Attendance.find({
      employee: empId,

      "checkIn.time": {
        $gte: start,
        $lt: end,
      },

      status: "checked-in",
    });

    const uniqueDays = new Set(
      records.map((r) => new Date(r.checkIn.time).toISOString().split("T")[0]),
    );

    const presentDays = uniqueDays.size;

    const daysInMonth = new Date(year, month, 0).getDate();

    const absentDays = daysInMonth - presentDays;

    res.json({
      month,
      year,
      presentDays,
      absentDays,
      totalRecords: records.length,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ======================
// Get Yearly Attendance Chart
// ======================
exports.getMyYearlyChart = async (req, res) => {
  try {
    const empId = req.user.id;

    const { year } = req.query;

    const result = [];

    for (let m = 1; m <= 12; m++) {
      const start = new Date(year, m - 1, 1);

      const end = new Date(year, m, 1);

      const records = await Attendance.find({
        employee: empId,

        "checkIn.time": {
          $gte: start,
          $lt: end,
        },

        status: "checked-in",
      });

      const uniqueDays = new Set(
        records.map(
          (r) => new Date(r.checkIn.time).toISOString().split("T")[0],
        ),
      );

      result.push({
        month: m,
        present: uniqueDays.size,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ======================
// Get Monthly Attendance Days
// ======================
exports.getMyMonthlyDays = async (req, res) => {
  try {
    const empId = req.user.id;

    const { month, year } = req.query;

    const daysInMonth = new Date(year, month, 0).getDate();

    const start = new Date(year, month - 1, 1);

    const end = new Date(year, month, 1);

    const records = await Attendance.find({
      employee: empId,

      "checkIn.time": {
        $gte: start,
        $lt: end,
      },

      status: "checked-in",
    });

    const map = {};

    records.forEach((r) => {
      const day = new Date(r.checkIn.time).getDate();

      map[day] = {
        present: 1,
        checkIn: r.checkIn?.time,
        checkOut: r.checkOut?.time,
      };
    });

    const result = [];

    for (let i = 1; i <= daysInMonth; i++) {
      result.push({
        day: i,
        present: map[i]?.present || 0,

        checkIn: map[i]?.checkIn || null,

        checkOut: map[i]?.checkOut || null,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getEmployeeMonthlyDays = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        message: "employeeId, month and year are required",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    const start = new Date(year, month - 1, 1);

    const end = new Date(year, month, 1);

    const records = await Attendance.find({
      employee: employeeId,

      "checkIn.time": {
        $gte: start,
        $lt: end,
      },
    }).sort({ "checkIn.time": 1 });

    const map = {};

    records.forEach((r) => {
      const day = new Date(r.checkIn.time).getDate();

      map[day] = {
        present: r.status === "checked-in" ? 1 : 0,

        // ===== DATE =====
        fullDate: r.checkIn?.time || null,

        // ===== CHECK IN =====
        checkInTime: r.checkIn?.time || null,

        checkInLocation: r.checkIn?.location || null,

        checkInDistance: r.checkIn?.distance || null,

        checkInAllowed: r.checkIn?.allowed || false,

        // ===== CHECK OUT =====
        checkOutTime: r.checkOut?.time || null,

        // ===== STATUS =====
        status: r.status || "absent",

        // ===== RECORD INFO =====
        createdAt: r.createdAt || null,

        updatedAt: r.updatedAt || null,
      };
    });

    const result = [];

    for (let i = 1; i <= daysInMonth; i++) {
      result.push({
        day: i,

        present: map[i]?.present || 0,

        fullDate: map[i]?.fullDate || null,

        checkInTime: map[i]?.checkInTime || null,

        checkInLocation: map[i]?.checkInLocation || null,

        checkInDistance: map[i]?.checkInDistance || null,

        checkInAllowed: map[i]?.checkInAllowed || false,

        checkOutTime: map[i]?.checkOutTime || null,

        status: map[i]?.status || "absent",

        createdAt: map[i]?.createdAt || null,

        updatedAt: map[i]?.updatedAt || null,
      });
    }

    res.json(result);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.hasCheckedInToday = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // بداية ونهاية اليوم
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      "checkIn.time": { $gte: start, $lte: end },
    });

    if (!attendance) {
      return res.json({
        checkedIn: false,
      });
    }

    return res.json({
      checkedIn: true,
      attendance,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.getAttendanceByDay = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { date } = req.query; // format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        message: "date is required",
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const record = await Attendance.findOne({
      employee: employeeId,
      "checkIn.time": { $gte: start, $lte: end },
    });

    return res.json(record || null);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
