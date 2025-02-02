const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    user: {
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    messages: [
        {
            role: { type: String, enum: ["user", "bot"], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Chat", ChatSchema);
