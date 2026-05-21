const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

const mongoDB = require('./db');
const UserData = require('./models/user');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/tickets', require('./routes/ticketRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/policies', require('./routes/policyRoutes'));
app.use('/resources', require('./routes/resourceRoutes'));
app.use('/approvals', require('./routes/approvalRoutes'));
const startApp = async () => {
    try {
        await mongoDB();

        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startApp()