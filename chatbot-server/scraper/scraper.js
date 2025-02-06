const axios = require("axios");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const { parseStringPromise } = require("xml2js");
require("dotenv").config();

// MongoDB Model
const InstituteData = require("../models/InstituteData");

const launchOptions = {
    headless: true,  // ✅ Run headless in production
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ],
    executablePath: process.env.CHROME_PATH || puppeteer.executablePath(),  // ✅ Use Render's Chromium path if available
};

// **Dynamic Content Extraction for WordPress**
const extractContent = async (url) => {
    console.log(`🔍 Scraping: ${url}`);

    const browser = await puppeteer.launch(launchOptions);
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


const fetchSitemapUrls = async (sitemapUrl) => {
    try {
        const { data } = await axios.get(sitemapUrl);
        const parsedSitemap = await parseStringPromise(data);
        const urls = [];

        // Check if the current sitemap contains website URLs or nested sitemaps
        if (parsedSitemap.urlset) {
            // Collect URLs if it's a regular sitemap with website links
            parsedSitemap.urlset.url.forEach((urlObj) => {
                urls.push(urlObj.loc[0]);
            });
        } else if (parsedSitemap.sitemapindex) {
            // If it contains nested sitemaps, recursively fetch them
            for (const sitemap of parsedSitemap.sitemapindex.sitemap) {
                const nestedUrls = await fetchSitemapUrls(sitemap.loc[0]);
                urls.push(...nestedUrls);
            }
        }

        return urls;
    } catch (error) {
        console.error(`❌ Error fetching or parsing sitemap ${sitemapUrl}:`, error.message);
        return [];
    }
};

const scrapeWebsite = async (websiteUrl) => {
    try {
        console.log("🚀 Checking for Sitemap...");
        const possibleSitemapUrls = [
            `${websiteUrl}/sitemap.xml`,
            `${websiteUrl}/wp-sitemap.xml`,
            `${websiteUrl}/sitemap_index.xml`
        ];

        let sitemapFound = null;
        for (const sitemapUrl of possibleSitemapUrls) {
            try {
                await axios.head(sitemapUrl);
                sitemapFound = sitemapUrl;
                break;
            } catch {
                // Ignore errors and try the next sitemap option
            }
        }

        if (!sitemapFound) {
            console.error("❌ No valid sitemap found.");
            return;
        }

        console.log(`✅ Sitemap found: ${sitemapFound}`);

        // Fetch all URLs from the sitemap
        const allUrls = await fetchSitemapUrls(sitemapFound);

        if (allUrls.length === 0) {
            console.log("❌ No URLs found in the sitemap.");
            return;
        }

        console.log(`✅ Found ${allUrls.length} pages to scrape.`);

        // Scrape content from each URL
        for (const url of allUrls) {
            await extractContent(url);
        }

        console.log("🎉 Scraping Complete!");
    } catch (error) {
        console.error("❌ Error scraping website:", error.message);
    }
};

// Example usage
scrapeWebsite("https://thecam.ca");


// Run the scraper
//scrapeWebsite();
