const express = require('express')

const userController = require('../controllers/users');
//const expenseController = require('../controllers/expenses');
//const authenticatemiddleware = require('../middleware/auth');
const expenseController = require('../controllers/expenses');
const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup',userController.signup)
//router.post('/login',userController.login)
//router.post('/addexpense',authenticatemiddleware.authenticate, expenseController.authenticate)
//router.get('/getexpense',authenticatemiddleware.authenticate, )

router.post('/login',userController.login)
router.get('/logout',userController.logout)

router.get('/download', authenticatemiddleware.authenticate, expenseController.downloadExpenses)

module.exports = router;