const Employee = require("../models/Employee");

const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne({})
    .sort({ createdAt: -1 })
    .select("employeeId");

  const year = new Date().getFullYear();

  let number = 1;

  if (lastEmployee && lastEmployee.employeeId) {
    const lastNumber = parseInt(lastEmployee.employeeId.split("-")[2]);
    number = lastNumber + 1;
  }

  const formatted = String(number).padStart(4, "0");

  return `EMP-${year}-${formatted}`;
};

module.exports = generateEmployeeId;