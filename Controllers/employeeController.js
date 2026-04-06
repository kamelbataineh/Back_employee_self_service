const Employee = require("../models/Employee");
const Department = require("../models/Department");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// تسجيل موظف (اختياري)
exports.registerEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      password,
      departmentId,
      subDepartmentName,
    } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "الإيميل موجود مسبقاً" });

    const employeeId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      age,
      password: hashedPassword,
      departmentId,
      subDepartmentName,
    });

    res.status(201).json({ message: "تم تسجيل الموظف", employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};

// إضافة موظف لقسم فرعي
exports.addEmployeeToSub = async (req, res) => {
  try {
    const {
      departmentId,
      subDepartmentId,
      name,
      phone,
      age,
      employeeId,
      role,
      password,
    } = req.body;

    if (
      !departmentId ||
      !subDepartmentId ||
      !name ||
      !employeeId ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "الرجاء تعبئة كل الحقول المطلوبة" });
    }

    // أولاً، إنشاء الموظف
    const newEmployee = { name, phone, age, employeeId, role, password };

    // البحث عن القسم الرئيسي
    const department = await Department.findById(departmentId);
    if (!department)
      return res.status(404).json({ message: "القسم غير موجود" });

    // البحث عن القسم الفرعي داخل القسم
    const subDept = department.subDepartments.id(subDepartmentId);
    if (!subDept)
      return res.status(404).json({ message: "القسم الفرعي غير موجود" });

    // 🟢 هنا نضيف طباعة للتأكد أن employees موجود
    console.log("Before push, subDept.employees:", subDept.employees);

    // إضافة الموظف للقسم الفرعي
    subDept.employees.push(newEmployee);

    // حفظ التغييرات
    await department.save();

    console.log("Employee added successfully");

    res.status(201).json({ message: "تمت إضافة الموظف بنجاح" });
  } catch (err) {
    console.error("Error in addEmployeeToSub:", err); 
    res.status(500).json({ message: "حدث خطأ في السيرفر", error: err.message });
  }
};

// جلب الموظفين حسب القسم الفرعي
exports.getEmployeesBySubDepartment = async (req, res) => {
  try {
    const { deptId, subId } = req.params;

    const department = await Department.findById(deptId);
    if (!department)
      return res.status(404).json({ message: "القسم غير موجود" });

    const sub = department.subDepartments.id(subId);
    if (!sub)
      return res.status(404).json({ message: "القسم الفرعي غير موجود" });

    res.status(200).json(sub.employees || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};
