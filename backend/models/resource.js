const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({

    resourceId: {
        type: String,
        required: true,
        unique: true
    },

    resourceName: {
        type: String,
        required: true
    },

    resourceType: {
        type: String,
        enum: [
            "database",
            "dashboard",
            "github",
            "aws",
            "jira"
        ],
        required: true
    },

    environment: {
        type: String,
        enum: [
            "development",
            "staging",
            "production"
        ],
        required: true
    },

    sensitivityLevel: {
        type: String,
        enum: [
            "low",
            "medium",
            "high",
            "critical"
        ],
        required: true
    },

    ownerDepartment: {
        type: String,
        required: true
    }

}, { timestamps: true });

module.exports =
    mongoose.models.Resource ||
    mongoose.model("Resource", ResourceSchema);