const mongoose = require("mongoose");

const ApprovalSchema = new mongoose.Schema({

    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },

    approverEmployeeId: {
        type: String,
        required: true
    },

    approvalStatus: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected"
        ],
        default: "pending"
    },

    comments: {
        type: String,
        default: ""
    }

}, { timestamps: true });

module.exports =
    mongoose.models.Approval ||
    mongoose.model("Approval", ApprovalSchema);