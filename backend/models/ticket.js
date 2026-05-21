const mongoose = require("mongoose");
const TicketSchema = new mongoose.Schema({

    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource"
    },

    requestedAccess: {
        type: String,
        enum: ["read", "write", "admin"]
    },

    businessJustification: {
        type: String
    },

    durationDays: {
        type: Number
    },

    status: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected",
            "escalated",
            "completed"
        ],
        default: "pending"
    },

    riskScore: {
        type: Number,
        default: 0
    },

    llmEvaluation: {
        recommendation: String,
        reason: String
    },

    processedByAgent: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("Ticket", TicketSchema);