const express = require('express')

const expenseauthentication = require('../middleware/auth')
const expenseController = require('../controllers/expenses');


const router = express.Router();

router.post('/add-expense', expenseauthentication.authenticate, expenseController.addExpense)
router.get('/monthlyexpenses/:year/:month', expenseauthentication.authenticate, expenseController.getMonthlyExpenses);
router.get('/yearlyexpenses/:year', expenseauthentication.authenticate, expenseController.getYearlyExpenses);
router.get('/get-expense', expenseauthentication.authenticate, expenseController.getExpense)
router.delete('/delete-expense/:expenseid', expenseController.deleteExpense)



module.exports = router;