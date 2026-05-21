const express = require('express');

const router = express.Router();

const {
    createPolicy,
    getAllPolicies,
    getPolicyByResourceName
} = require('../controllers/policyController');

router.get('/', getAllPolicies);

router.get('/:resourceName', getPolicyByResourceName);

router.post('/', createPolicy);

module.exports = router;