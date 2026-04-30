const Admin = require("../models/Admin");

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

exports.checkAttendanceLocation = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const { latitude, longitude } = req.body;

    const admin = await Admin.findById(adminId);

    if (!admin || !admin.companyLocation) {
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

    const minDistance = 2;
    const maxDistance = admin.maxDistance || 1000;

    if (distance < minDistance) {
      return res.status(403).json({
        allowed: false,
        message: "Too close to location",
        distance,
      });
    }

    if (distance > maxDistance) {
      return res.status(403).json({
        allowed: false,
        message: "Outside allowed range",
        distance,
        maxDistance,
      });
    }

    return res.json({
      allowed: true,
      message: "Allowed",
      distance,
      maxDistance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
