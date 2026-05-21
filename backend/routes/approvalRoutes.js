const express = require('express');

const router = express.Router();

const {
    getAllApprovals,
    getApprovalById,
    updateApprovalStatus
} = require('../controllers/approvalController');


router.get('/', getAllApprovals);

router.get('/:id', getApprovalById);

router.patch('/:id', updateApprovalStatus);

module.exports = router;