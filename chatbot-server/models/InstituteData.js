const mongoose = require("mongoose");

const InstituteDataSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true }, // ✅ Add URL field
    title: { type: String, required: true },
    body: { type: String, required: true },
}, { strict: false }); // ✅ Allows extra fields if needed

module.exports = mongoose.model("InstituteData", InstituteDataSchema);
