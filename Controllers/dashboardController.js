// Controllers\dashboardController.js

const Department = require("../models/Department");

///////////////////////
////
////
///////////////////////

exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const dept = await Department.create({ name });
    res.status(201).json({ message: "تم إنشاء القسم", department: dept });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};

///////////////////////
////
////
///////////////////////

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().lean();
    res.status(200).json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};
