const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const faqRoutes = require("./routes/faqRoutes");
//const scraperRoutes = require("./routes/scraperRoutes");  // ✅ Import scraper routes

const app = express();
app.use(
    cors({
        origin: "*",  // Allow all origins (not recommended for production)
        credentials: true,
    })
);
app.use(bodyParser.json());

connectDB();

// Chat & FAQ Routes
app.use("/chat", chatRoutes);
app.use("/faqs", faqRoutes);
//app.use("/scraper", scraperRoutes); // ✅ Add scraper routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
