const express = require('express')
const expensesController = require("../controller/expensesController.js")
const verifyToken = require('../middllewares/authMiddleware')

const router = express.Router()

// router.get("/", productsController.home);
// router.get("/", expensesController.getAllEmployee);
// router.get("/:username", employeeController.getEmployeesById);
// router.post("/", employeeController.postData )
// router.delete("/:id", employeeController.deleteEmployees);
// router.patch("/:id", employeeController.editEmployeeById);

router.post("/", verifyToken, expensesController.createExpense)
router.get("/", expensesController.findAll)
router.get("/me", expensesController.findMe)
router.get("/total", expensesController.getTotalExpenses)
router.post("/login", expensesController.loginUser)
// router.post("/", expensesController.loginUser)
router.get("/:id", expensesController.findByID)
router.delete("/:id", expensesController.deleteExpense)
router.patch("/:id", expensesController.updateExpense)

// 1. Ketika create expense, tidak terima UserId di body
//      Otomatis dapetin ID user yang sedang login
//      lalu masukin ke UserId di setiap expense yang dibuat

// 2. Dapeting list expenses dari user yang sedang login
//      jangan pake body, query atau params

module.exports = router;