const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect(process.env.DB_URI)
    .then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host}`);
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
};

module.exports = connectDB; 