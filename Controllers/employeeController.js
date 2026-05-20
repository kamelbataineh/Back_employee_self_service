// Controllers\employeeController.js
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const generateEmployeeId = require("../utils/generateEmployeeId");
const jwt = require("jsonwebtoken");

/**
 * Employee login
 */
exports.loginEmployee = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Please enter email or employee ID and password",
      });
    }

    const employee = await Employee.findOne({
      $or: [{ email: identifier }, { employeeId: identifier }],
    });

    if (!employee) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        email: employee.email,
        employeeId: employee.employeeId,
        role: employee.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        role: employee.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * Add employee to sub-department
 */
exports.addEmployeeToSub = async (req, res) => {
  try {
    const {
      departmentId,
      subDepartmentId,
      name,
      email,
      phone,
      age,
      role,
      password,
    } = req.body;

    if (!departmentId || !subDepartmentId || !name || !email || !password) {
      return res.status(400).json({ message: "Please fill required fields" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subDept = department.subDepartments.id(subDepartmentId);
    if (!subDept) {
      return res.status(404).json({ message: "Sub-department not found" });
    }

    subDept.employees = subDept.employees || [];

    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const employeeId = "EMP-" + Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email,
      phone,
      age,
      role,
      password: hashedPassword,
      employeeId,
      admin: req.user.adminId,
    });

    subDept.employees.push(employee);

    department.markModified("subDepartments");
    await department.save();

    return res.status(201).json({
      message: "Employee added successfully",
      employee,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

/**
 * Get employees by sub-department
 */
exports.getEmployeesBySubDepartment = async (req, res) => {
  try {
    const { deptId, subId } = req.params;

    const department = await Department.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const sub = department.subDepartments.id(subId);
    if (!sub) {
      return res.status(404).json({ message: "Sub-department not found" });
    }

    res.status(200).json(sub.employees || []);
  } catch (err) {
    res.status(500).json({
      message: "An error occurred",
      error: err.message,
    });
  }
};

/**
 * Get logged-in employee profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const empId = req.employee.id;

    console.log("EMP ID:", empId);

    const department = await Department.findOne({
      "subDepartments.employees._id": new mongoose.Types.ObjectId(empId),
    });

    if (!department) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let result = null;

    department.subDepartments.forEach((sub) => {
      sub.employees.forEach((emp) => {
        if (emp._id.toString() === empId.toString()) {
          result = {
            employee: {
              id: emp._id,
              name: emp.name,
              email: emp.email,
              phone: emp.phone,
              age: emp.age,
              role: emp.role,
              employeeId: emp.employeeId,
            },
            department: {
              id: department._id,
              name: department.name,
            },
            subDepartment: {
              id: sub._id,
              name: sub.name,
            },
          };
        }
      });
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get employee by ID
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const empId = req.params.id;

    const department = await Department.findOne({
      "subDepartments.employees._id": new mongoose.Types.ObjectId(empId),
    });

    if (!department) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let result = null;

    department.subDepartments.forEach((sub) => {
      sub.employees.forEach((emp) => {
        if (emp._id.toString() === empId) {
          result = {
            employee: {
              id: emp._id,
              name: emp.name,
              phone: emp.phone,
              age: emp.age,
              role: emp.role,
              email: emp.email,
              employeeId: emp.employeeId,
              admin: emp.admin,
              createdAt: emp.createdAt,
              updatedAt: emp.updatedAt,
            },
            department: {
              id: department._id,
              name: department.name,
            },
            subDepartment: {
              id: sub._id,
              name: sub.name,
            },
          };
        }
      });
    });

    if (!result) {
      return res
        .status(404)
        .json({ message: "Employee not found inside department" });
    }

    return res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get company location for employee
 */
exports.getCompanyLocationForEmployee = async (req, res) => {
  try {
    console.log("🔑 EMPLOYEE:", req.employee);

    const employeeId = req.employee.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const admin = await Admin.findById(employee.admin).select(
      "companyLocation maxDistance",
    );

    if (!admin || !admin.companyLocation) {
      return res.status(404).json({
        message: "Company location has not been set yet",
      });
    }

    res.json({
      companyLocation: admin.companyLocation,
      maxDistance: admin.maxDistance,
    });
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// Get All Company Employees
// ==============================
exports.getCompanyEmployees = async (req, res) => {
  try {
    const departments = await Department.find({
      adminId: req.user.adminId,
    });

    res.status(200).json({
      departments,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
