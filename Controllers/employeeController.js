// Controllers\employeeController.js
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const bcrypt = require("bcrypt");
const generateEmployeeId = require("../utils/generateEmployeeId");
const jwt = require("jsonwebtoken");

exports.loginEmployee = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier = email OR employeeId

    if (!identifier || !password) {
      return res.status(400).json({
        message: "الرجاء إدخال الإيميل أو رقم الموظف وكلمة المرور",
      });
    }

    // 1. البحث بالإيميل أو employeeId
    const employee = await Employee.findOne({
      $or: [{ email: identifier }, { employeeId: identifier }],
    });

    if (!employee) {
      return res.status(404).json({
        message: "المستخدم غير موجود",
      });
    }

    // 2. التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "كلمة المرور غير صحيحة",
      });
    }

    // 3. إنشاء JWT Token
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
      message: "تم تسجيل الدخول بنجاح",
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
      message: "خطأ في السيرفر",
      error: err.message,
    });
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
    if (!department) {
      return res.status(404).json({ message: "القسم غير موجود" });
    }

    const subDept = department.subDepartments.id(subDepartmentId);
    if (!subDept) {
      return res.status(404).json({ message: "القسم الفرعي غير موجود" });
    }

    subDept.employees = subDept.employees || [];

    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "الإيميل مستخدم مسبقاً" });
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
      message: "تمت إضافة الموظف بنجاح",
      employee,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "خطأ في السيرفر",
      error: err.message,
    });
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

exports.getMyProfile = async (req, res) => {
  try {
    const empId = req.employee.id;

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

    if (!result) {
      return res.status(404).json({ message: "الموظف غير موجود" });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message,
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
      return res.status(404).json({ message: "Employee not found inside department" });
    }

    return res.json(result);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};