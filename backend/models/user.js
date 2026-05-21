const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    employeeId: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    department: {
        type: String,
        required: true
    },

    managerEmployeeId: {
        type: String
    }

}, { timestamps: true });

module.exports =
    mongoose.models.User ||
    mongoose.model("User", UserSchema);