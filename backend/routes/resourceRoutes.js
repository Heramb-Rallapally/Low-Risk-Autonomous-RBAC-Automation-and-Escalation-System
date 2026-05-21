const express = require('express');

const router = express.Router();

const {
    createResource,
    getAllResources,
    getResourceByName
} = require('../controllers/resourceController');

router.get('/', getAllResources);

router.get('/:resourceName', getResourceByName);

router.post('/', createResource);

module.exports = router;