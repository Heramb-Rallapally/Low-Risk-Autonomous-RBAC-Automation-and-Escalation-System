const mongoose = require('mongoose');


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