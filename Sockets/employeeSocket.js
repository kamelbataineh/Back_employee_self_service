// Sockets\employeeSocket.js
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Employee socket connected:", socket.id);

    socket.on("get_company_location", async (data) => {
      try {
        const employeeId = data.employeeId;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
          return socket.emit("company_location_error", {
            message: "Employee not found",
          });
        }

        const admin = await Admin.findById(employee.admin).select(
          "companyLocation maxDistance",
        );

        if (!admin || !admin.companyLocation) {
          return socket.emit("company_location_error", {
            message: "Company location has not been set yet",
          });
        }

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
      console.log("❌ Employee socket disconnected:", socket.id);
    });
  });
};
