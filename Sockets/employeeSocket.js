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

    socket.on("get_company_location", async (data) => {
      try {
        const employeeId = data.employeeId;

        const employee = await Employee.findById(employeeId)
          .select("admin")
          .lean();

        if (!employee) {
          return socket.emit("company_location_error", {
            message: "Employee not found",
          });
        }

        const admin = await Admin.findById(employee.admin)
          .select("companyLocation maxDistance")
          .lean();

        if (!admin || !admin.companyLocation) {
          return socket.emit("company_location_error", {
            message: "Company location not set",
          });
        }

        socket.emit("company_location_success", {
          companyLocation: admin.companyLocation,
          maxDistance: admin.maxDistance,
        });
      } catch (err) {
        console.error(err);
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
