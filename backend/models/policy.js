const mongoose = require('mongoose');
const PolicySchema = new mongoose.Schema({

    policyName: {
        type: String,
        required: true
    },

    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource"
    },

    resourceName: {
        type: String,
        required: true
    },

    allowedDepartments: [{
        type: String
    }],

    allowedAccessLevels: [{
        type: String,
        enum: ["read", "write", "admin"]
    }],

    requiresManagerApproval: {
        type: Boolean,
        default: false
    },

    maxDurationDays: {
        type: Number,
        default: 30
    }

}, { timestamps: true });

module.exports =
    mongoose.models.Policy ||
    mongoose.model("Policy", PolicySchema);