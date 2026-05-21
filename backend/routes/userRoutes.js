const express = require('express');

const router = express.Router();

const {
    getAllUsers,
    getUserByEmployeeId,
    createUser
}= require('../controllers/userController');

router.get('/', getAllUsers);
router.get('/:employeeId', getUserByEmployeeId);
router.post('/', createUser);


module.exports = router;
