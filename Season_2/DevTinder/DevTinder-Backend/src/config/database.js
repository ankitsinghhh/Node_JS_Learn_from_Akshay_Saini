const mongoose = require('mongoose');
// require('dotenv').config();

const mongoURI = process.env.DB_CONNECTION_SECRET // your actual connection string

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
