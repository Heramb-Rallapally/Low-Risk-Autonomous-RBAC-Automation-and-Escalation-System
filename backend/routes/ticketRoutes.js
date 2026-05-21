const express = require('express');

const router = express.Router();

const {
    getAllTickets,
    getTicketById,
    createTicket
} = require('../controllers/ticketController');

router.get('/', getAllTickets);

router.get('/:id', getTicketById);

router.post('/', createTicket);

module.exports = router;