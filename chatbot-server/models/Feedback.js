const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.Mixed,  // Stores user information (email, name, etc.)
        required: true,
    },
    rating: {
        type: Number,  // Rating between 1 and 5
        min: 1,
        max: 5,
        required: true,
    },
    comments: {
        type: String,  // User feedback or comments
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
