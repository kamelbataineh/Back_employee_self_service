// Controllers\employeeController.js

const Employee = require("../models/Employee");
const Department = require("../models/Department");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

///////////////////////
////
// اضافه موظف
////
///////////////////////

exports.createEmployee = async (req, res) => {
  try {
    const existing = await Employee.findOne({
      employeeId: req.body.employeeId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "هذا الرقم الوظيفي موجود مسبقًا" });
    }

    const employee = await Employee.create(req.body);

    await Department.findByIdAndUpdate(employee.department, {
      $inc: { employeeCount: 1 },
    });

    res.status(201).json({ message: "تم إضافة الموظف", employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};

///////////////////////
////
// جلب موظفين حسب القسم
////
///////////////////////
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const employees = await Employee.find({
      department: departmentId,
    }).populate("department", "name");

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب موظفين القسم",
      error: error.message,
    });
  }
};

///////////////////////
////
// جلب عدد كل الموظفين
////
///////////////////////
exports.getEmployeesCount = async (req, res) => {
  try {
    const count = await Employee.countDocuments();

    res.status(200).json({ totalEmployees: count });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب العدد",
      error: error.message,
    });
  }
};

///////////////////////
////
// جلب معلومات الموظف حسب ال id
////
///////////////////////

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate("department", "name");

    if (!employee) {
      return res.status(404).json({ message: "الموظف غير موجود" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب الموظف",
      error: error.message,
    });
  }
};
