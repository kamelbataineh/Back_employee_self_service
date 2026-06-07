// Sockets\employeeSocket.js
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Employee socket connected:", socket.id);

    let employeeId = null;

    // 🔥 join room
    socket.on("join", (data) => {
      employeeId = data.employeeId;
      socket.join(employeeId);
      console.log("📥 joined room:", employeeId);
    });

    // 🔥 FAST VERSION (no Employee query)
    socket.on("get_company_location", async (data) => {
      try {
        const adminId = data.adminId; // 🔥 أرسلها من Flutter

        const admin = await Admin.findById(adminId)
          .select("companyLocation maxDistance")
          .lean(); // 🔥 أسرع

        if (!admin || !admin.companyLocation) {
          return socket.emit("company_location_error", {
            message: "Company location not set",
          });
        }

        // 🔥 direct emit (no need to re-query employee)
        socket.emit("company_location_success", {
          companyLocation: admin.companyLocation,
          maxDistance: admin.maxDistance,
        });
      } catch (err) {
        console.error("❌ SOCKET ERROR:", err);
        socket.emit("company_location_error", {
          message: err.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ disconnected:", socket.id);
    });
  });
};
