const Department = require("../models/Department");
const translateName = require("../utils/translateName");

// ======================
// Create Department
// ======================
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name required",
      });
    }

    const translated = await translateName(name);

    const department = await Department.create({
      adminId: req.user.adminId,

      name: translated,

      subDepartments: [],
    });

    res.status(201).json(department);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ======================
// Get All Departments
// ======================
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      adminId: req.user.adminId,
    });

    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ======================
// Add Sub Department
// ======================
exports.addSubDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const { name } = req.body;

    const department = await Department.findOne({
      _id: departmentId,
      adminId: req.user.adminId,
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const translated = await translateName(name);

    const exists = department.subDepartments.find(
      (sub) => sub.name.en === translated.en,
    );

    if (exists) {
      return res.status(400).json({
        message: "Sub department already exists",
      });
    }

    department.subDepartments.push({
      name: translated,
      employees: [],
    });

    await department.save();

    res.status(200).json({
      message: "Sub department created successfully",
      department,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ======================
// Get Department By ID
// ======================
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      adminId: req.user.adminId,
    }).lean();

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.status(200).json(department);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ======================
// Get Employees By Sub Department
// ======================
exports.getEmployeesBySubDepartment = async (req, res) => {
  try {
    const { deptId, subId } = req.params;

    const department = await Department.findOne({
      _id: deptId,
      adminId: req.user.adminId,
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const subDept = department.subDepartments.id(subId);

    if (!subDept) {
      return res.status(404).json({
        message: "Sub department not found",
      });
    }

    res.status(200).json(subDept.employees);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
