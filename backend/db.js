const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://heramb3112_db_user:6ciCJFsxzKYXlGfe@cluster0.omdhtfe.mongodb.net/?appName=Cluster0';

const mongoDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("LOG: Connected to MongoDB successfully!");
  } catch (error) {
    console.error("LOG: Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

mongoDB();

module.exports = mongoDB;