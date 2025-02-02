const express = require("express");
const router = express.Router();
const scrapeCAMData = require("../scraper/scraper");
const InstituteData = require("../models/InstituteData");

// Endpoint to trigger scraping manually
router.get("/scrape", async (req, res) => {
    try {
        await scrapeCAMData();
        res.json({ message: "Scraping completed successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Scraping failed", details: error.message });
    }
});

// Endpoint to fetch scraped data
router.get("/data", async (req, res) => {
    try {
        const data = await InstituteData.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = router;
