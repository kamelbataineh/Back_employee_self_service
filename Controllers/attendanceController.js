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
    const employeeId = req.user.id;

    const attendance = await Attendance.findOne({
      employee: employeeId,
      "checkOut.time": null,
    }).sort({ createdAt: -1 });

    if (!attendance) {
      return res.status(404).json({
        message: "No active check-in found",
      });
    }

    attendance.checkOut = {
      time: new Date(),
    };

    await attendance.save();

    res.json({
      message: "Checked out successfully",
      attendance,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
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
