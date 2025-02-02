const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title: String,       // e.g., "Graphic & UI/UX"
    description: String, // Course details
    source: String       // Page URL where it was found
});

module.exports = mongoose.model("Course", CourseSchema);
