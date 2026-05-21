const Resource = require('../models/Resource');

exports.getAllResources = async (req, res) => {

    try {

        const resources = await Resource.find();

        res.status(200).json(resources);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.getResourceByName = async (req, res) => {

    try {

        const resource = await Resource.findOne({
            resourceName: req.params.resourceName
        });

        if (!resource) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        res.status(200).json(resource);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.createResource = async (req, res) => {

    try {

        const resource = await Resource.create(req.body);

        res.status(201).json(resource);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};