const axios = require("axios");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const { parseStringPromise } = require("xml2js");
require("dotenv").config();

// MongoDB Model
const InstituteData = require("../models/InstituteData");

 

// **Dynamic Content Extraction for WordPress**
const extractContent = async (url) => {
    console.log(`🔍 Scraping: ${url}`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

        const content = await page.evaluate(() => {
            const getText = (selector) => {
                let el = document.querySelector(selector);
                return el ? el.innerText.trim() : null;
            };

            return {
                title: getText("h1") || getText("title") || document.title,
                content: document.querySelector("article")?.innerText || getText("body"),
            };
        });

        await browser.close();

        if (!content.title || !content.content) {
            console.error(`❌ Skipping ${url}: No valid content found.`);
            return null;
        }

        console.log(`📌 Saving Data from: ${url}`);

        // ✅ Append URL to the content
        const formattedContent = `${content.content}\n\n🔗 **Source:** [Click Here](${url})`;

        // Save to MongoDB
        await InstituteData.updateOne(
            { url },  // ✅ Use URL as the unique identifier
            { $set: { url, title: content.title, body: formattedContent } },
            { upsert: true }
        );

        return content;
    } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error.message);
        await browser.close();
        return null;
    }
};

// **Fetch and Process Sitemap**
const scrapeWebsite = async () => {
    try {
        console.log("🚀 Fetching Sitemap...");
        const { data } = await axios.get("https://thecam.ca/wp-sitemap-posts-page-1.xml");
        const parsedSitemap = await parseStringPromise(data);
        const urls = parsedSitemap.urlset.url.map(urlObj => urlObj.loc[0]);

        console.log(`✅ Found ${urls.length} pages in sitemap.`);

        for (const url of urls) {
            await extractContent(url);
        }

        console.log("🎉 Scraping Complete!");
    } catch (error) {
        console.error("❌ Error fetching Sitemap:", error.message);
    }
};

// Run the scraper
scrapeWebsite();
