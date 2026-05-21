const Approval = require('../models/Approval');


// GET ALL APPROVALS
exports.getAllApprovals = async (req, res) => {

    try {

        const approvals = await Approval.find();

        res.status(200).json(approvals);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};
// GET APPROVAL BY ID
exports.getApprovalById = async (req, res) => {

    try {

        const approval = await Approval.findById(req.params.id);

        if (!approval) {

            return res.status(404).json({
                message: "Approval not found"
            });

        }

        res.status(200).json(approval);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

// UPDATE APPROVAL STATUS
exports.updateApprovalStatus = async (req, res) => {

    try {

        const {
            approvalStatus,
            comments
        } = req.body;

        const approval = await Approval.findById(req.params.id);

        if (!approval) {

            return res.status(404).json({
                message: "Approval not found"
            });

        }

        approval.approvalStatus = approvalStatus;

        approval.comments = comments;

        await approval.save();

        res.status(200).json({
            message: "Approval updated successfully",
            approval
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};