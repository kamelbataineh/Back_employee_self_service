// Controllers\employeeController.js

const Employee = require("../models/Employee");
const Department = require("../models/Department");
const bcrypt = require("bcrypt");
const generateEmployeeId = require("../utils/generateEmployeeId");
const jwt = require("jsonwebtoken");
///////////////////////
// إضافة موظف لقسم فرعي (من الأدمن)
///////////////////////

exports.employeeLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res
        .status(400)
        .json({ message: "رقم الموظف وكلمة المرور مطلوبين" });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "الموظف غير موجود" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "كلمة المرور غير صحيحة" });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        employeeId: employee.employeeId,
        role: employee.role,
      },
      "SECRET_KEY_123",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      employee,
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

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
      return res.status(400).json({ message: "الرجاء تعبئة الحقول المطلوبة" });
    }

    const department = await Department.findById(departmentId);
    if (!department)
      return res.status(404).json({ message: "القسم غير موجود" });

    const subDept = department.subDepartments.id(subDepartmentId);
    if (!subDept)
      return res.status(404).json({ message: "القسم الفرعي غير موجود" });

    const exists = await Employee.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "الإيميل مستخدم مسبقاً" });

    const employeeId = await generateEmployeeId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email,
      phone,
      age,
      role,
      password: hashedPassword,
      employeeId,
    });

    subDept.employees.push(employee);
    await department.save();

    res.status(201).json({
      message: "تمت إضافة الموظف بنجاح",
      employee,
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

///////////////////////
// جلب موظفي قسم فرعي
///////////////////////
exports.getEmployeesBySubDepartment = async (req, res) => {
  try {
    const { deptId, subId } = req.params;

    const department = await Department.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: "القسم غير موجود" });
    }

    const sub = department.subDepartments.id(subId);
    if (!sub) {
      return res.status(404).json({ message: "القسم الفرعي غير موجود" });
    }

    res.status(200).json(sub.employees || []);
  } catch (err) {
    res.status(500).json({
      message: "حدث خطأ",
      error: err.message,
    });
  }
};

///////////////////////
// جلب موظف بواسطة ID (من أي قسم)
///////////////////////
exports.getEmployeeById = async (req, res) => {
  try {
    const empId = req.params.id;

    const department = await Department.findOne({
      "subDepartments.employees._id": empId,
    });

    if (!department) {
      return res.status(404).json({ message: "الموظف غير موجود" });
    }

    let result = null;

    department.subDepartments.forEach((sub) => {
      const emp = sub.employees.find((e) => e._id.toString() === empId);

      if (emp) {
        result = {
          employee: emp,
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

    if (!result) {
      return res.status(404).json({ message: "الموظف غير موجود" });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: "خطأ في السيرفر",
      error: err.message,
    });
  }
};
