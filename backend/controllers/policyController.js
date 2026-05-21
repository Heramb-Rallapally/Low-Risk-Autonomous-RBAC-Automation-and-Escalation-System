const Policy = require('../models/Policy');
const Resource = require('../models/Resource');
exports.getAllPolicies = async (req, res) => {

    try {

        const policies = await Policy.find();

        res.status(200).json(policies);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.getPolicyByResourceName =
async (req, res) => {

    try {

        const policy = await Policy.findOne({
            resourceName:
                req.params.resourceName
        });

        if (!policy) {

            return res.status(404).json({
                message: "Policy not found"
            });

        }

        res.status(200).json(policy);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.createPolicy = async (req, res) => {

    try {

        const policy = await Policy.create(req.body);

        res.status(201).json(policy);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};