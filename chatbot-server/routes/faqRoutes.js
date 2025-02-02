const express = require("express");
const router = express.Router();
const FAQ = require("../models/FAQ");

// Load FAQ Data
const faqData = require("../data/faqData.json");

// API to Load FAQs into MongoDB (Run Once)
router.post("/load-faqs", async (req, res) => {
    try {
        await FAQ.deleteMany(); // Clear previous FAQs
        await FAQ.insertMany(faqData);
        res.json({ message: "FAQs loaded successfully!" });
    } catch (error) {
        console.error("Error loading FAQs:", error);
        res.status(500).json({ error: "Failed to load FAQ data." });
    }
});

module.exports = router;  // ✅ Make sure you are correctly exporting as `router`
