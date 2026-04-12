// Controllers\dashboardController.js

const Department = require("../models/Department");

///////////////////////
////
////
///////////////////////
exports.createDepartment = async (req, res) => {
  try {
    const { name, subDepartments } = req.body;
    const dept = await Department.create({ name, subDepartments });
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

exports.addSubDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "القسم الكبير غير موجود" });
    }

    // منع التكرار
    const exists = department.subDepartments.find((sub) => sub.name === name);

    if (exists) {
      return res.status(400).json({
        message: "هذا القسم الفرعي موجود مسبقاً",
      });
    }

    department.subDepartments.push({ name, employees: [] });

    await department.save();

    res.status(200).json({
      message: "تم إنشاء القسم الفرعي",
      department,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};

// جلب قسم واحد حسب الـ ID
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).lean();

    if (!department) {
      return res.status(404).json({ message: "القسم غير موجود" });
    }

    res.status(200).json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};

exports.getEmployeesBySubDepartment = async (req, res) => {
  try {
    const { deptId, subId } = req.params;

    const department = await Department.findById(deptId);
    if (!department)
      return res.status(404).json({ message: "القسم غير موجود" });

    const subDept = department.subDepartments.id(subId);
    if (!subDept)
      return res.status(404).json({ message: "القسم الفرعي غير موجود" });

    res.status(200).json(subDept.employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "حدث خطأ في السيرفر", error: err.message });
  }
};
