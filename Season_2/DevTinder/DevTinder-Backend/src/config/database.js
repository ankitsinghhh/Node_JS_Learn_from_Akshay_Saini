const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://ankitsingh79834:iqZvKmb1kaN5rGic@cluster0.e58nx.mongodb.net/devTinder"; // your actual connection string

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        console.log('Already connected to the database');
        return;
    }

    try {
        await mongoose.connect(mongoURI); // Use your actual MongoDB URI here
        console.log("Database connection established");
    } catch (err) {
        console.error("Database connection failed:", err);
        throw err;
    }
};

module.exports = { connectDB };
