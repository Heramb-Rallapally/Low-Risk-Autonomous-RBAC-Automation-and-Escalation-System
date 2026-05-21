const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Policy = require('../models/Policy');
const Approval = require('../models/Approval');

const evaluateRisk = require('../services/riskEvaluationServices');


// GET ALL TICKETS
exports.getAllTickets = async (req, res) => {

    try {

        const tickets = await Ticket.find();

        res.status(200).json(tickets);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch tickets",
            error: error.message
        });

    }

};


// CREATE TICKET
exports.createTicket = async (req, res) => {

    try {

        const {
            requesterEmployeeId,
            resourceName,
            requestedAccess,
            businessJustification,
            durationDays
        } = req.body;

        // FETCH USER
        const user = await User.findOne({
            employeeId: requesterEmployeeId
        });

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        // FETCH RESOURCE
        const resource = await Resource.findOne({
            resourceName: resourceName
        });

        if (!resource) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        // FETCH POLICY
        const policy = await Policy.findOne({
            resourceId: resource._id
        });

        let evaluation;

        // NO POLICY CASE
        if (!policy) {

            evaluation = {
                decision: "ESCALATE",
                riskScore: 95,
                reason: "No policy exists for requested resource"
            };

        } else {

            // RISK EVALUATION
            evaluation = await evaluateRisk({
                user,
                resource,
                policy,
                requestedAccess,
                durationDays
            });

        }

        // CREATE TICKET
        const ticket = await Ticket.create({

            requesterId: user._id,

            resourceId: resource._id,

            requestedAccess,

            businessJustification,

            durationDays,

            status:
                evaluation.decision === "APPROVE"
                    ? "approved"
                    : evaluation.decision === "ESCALATE"
                    ? "escalated"
                    : "rejected",

            riskScore: evaluation.riskScore,

            llmEvaluation: {
                recommendation: evaluation.decision,
                reason: evaluation.reason
            },

            processedByAgent: true

        });

        // CREATE APPROVAL FOR ESCALATED TICKETS
        if (evaluation.decision === "ESCALATE") {

            await Approval.create({

                ticketId: ticket._id,

                approverEmployeeId: "EMP1003",

                approvalStatus: "pending",

                comments: "Awaiting manager approval"

            });

        }

        res.status(201).json({
            message: "Ticket created successfully",
            ticket
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};


// GET TICKET BY ID
exports.getTicketById = async (req, res) => {

    try {

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {

            return res.status(404).json({
                message: "Ticket not found"
            });

        }

        res.status(200).json(ticket);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch ticket",
            error: error.message
        });

    }

};