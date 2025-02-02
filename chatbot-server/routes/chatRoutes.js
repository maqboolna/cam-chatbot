const express = require("express");
const axios = require("axios");
const router = express.Router();
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const FAQ = require("../models/FAQ");
const InstituteData = require("../models/InstituteData");
const Feedback = require("../models/Feedback");  // ✅ Import Feedback model

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// **🔹 OpenAI API Call with Improved Context**
const queryOpenAI = async (question, context) => {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `
                      You are a friendly AI assistant for CAM Institute, helping students with inquiries. Respond conversationally and provide helpful, structured answers. Include additional suggestions or tips when applicable.
                      
                      Example:
                      User: "Can you tell me about the library facilities?"
                      Response: "Sure! CAM Institute’s library is open to students 24/7, offering access to design resources, textbooks, and online databases. Need help accessing them? Just let me know."
                      
                      Context: 
                      ${context}
                        `
                    },
                    { role: "user", content: question }
                ],
                max_tokens: 1000,
                temperature: 0.7
            },
            {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" }
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("❌ OpenAI Error:", error.message);
        return null;
    }
};

// **🔹 Full-Document Search (Dynamic Like Word Search)**
const extractRelevantText = (body, message) => {
    if (!body) return null;

    const match = body.match(new RegExp(`.{0,200}${message}.{0,200}`, "i")); // Get up to 200 characters before & after match
    return match ? match[0] : null;
};

// Function to escape special characters in regex
const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// **🔹 Chat Route - MongoDB + FAQ + OpenAI Hybrid**
router.post("/", async (req, res) => {
    const { user, message } = req.body;

    if (!user || !message) {
        return res.status(400).json({ error: "User details and message are required." });
    }

    try {
        let botResponse;

        // ✅ Detect if the user is ending the conversation
        const endKeywords = ["bye", "goodbye", "exit", "end", "see you"];
        if (endKeywords.some((keyword) => message.toLowerCase().includes(keyword))) {
            botResponse = "Thank you for chatting with us! Could you take a moment to provide feedback? Please rate your experience from 1 to 5 and share any comments.";

            // Save the chat and prompt for feedback
            let chat = await Chat.findOne({ "user.email": user.email });
            if (!chat) {
                chat = new Chat({ user, messages: [] });
            }
            chat.messages.push({ role: "user", content: message });
            chat.messages.push({ role: "bot", content: botResponse });

            await chat.save();

            return res.json({ response: botResponse });
        }

        // ✅ Escape special characters in the message
        const escapedMessage = escapeRegex(message);

        // ✅ **Step 1: Check the FAQs Collection First**
        const faqResult = await FAQ.findOne({ question: { $regex: escapedMessage, $options: "i" } });
        if (faqResult) {
            console.log("📌 Found FAQ:", faqResult);
            botResponse = faqResult.answer;
        } else {
            // ✅ **Step 2: Search the Scraped Institute Data**
            const scrapedData = await mongoose.connection
                .collection("institutedatas")
                .findOne({ body: { $regex: escapedMessage, $options: "i" } });

            if (scrapedData) {
                console.log("📌 Found relevant data in institute data.");
                let relevantText = extractRelevantText(scrapedData.body, message) || scrapedData.body.substring(0, 300);
                let extractedUrl = scrapedData.url;

                botResponse = `📌 **${scrapedData.title}**\n\n${relevantText}`;
                if (extractedUrl) {
                    botResponse += `...\n\n🔗 **More Info:** [Click Here](${extractedUrl})`;
                }
            } else {
                // ✅ **Step 3: Use OpenAI for Unavailable Data**
                const allData = await mongoose.connection.collection("institutedatas").find({}).toArray();
                const formattedContext = allData
                    .map((doc) => `${doc.title}: ${doc.body.substring(0, 500)}... More info: ${doc.url}`)
                    .join("\n\n");

                botResponse = await queryOpenAI(message, formattedContext);

                if (botResponse) {
                    // ✅ **Step 4: Save OpenAI Response for Future Queries**
                    const newFAQ = new FAQ({ question: message, answer: botResponse });
                    await newFAQ.save();
                    console.log("✅ New FAQ added from OpenAI.");
                } else {
                    botResponse = "I couldn't find relevant information. Please visit our website for more details.";
                }
            }
        }

        // ✅ **Step 5: Save Chat History**
        let chat = await Chat.findOne({ "user.email": user.email });
        if (!chat) {
            chat = new Chat({ user, messages: [] });
        }

        chat.messages.push({ role: "user", content: message });
        chat.messages.push({ role: "bot", content: botResponse });

        await chat.save();

        res.json({ response: botResponse });

    } catch (error) {
        console.error("❌ Chat Error:", error.message);
        res.status(500).json({ error: "Something went wrong." });
    }
});

// ✅ Route for submitting feedback
router.post("/feedback", async (req, res) => {
    const { user, rating, comments } = req.body;

    if (!user || !rating || !comments) {
        return res.status(400).json({ error: "User details, rating, and comments are required." });
    }

    try {
        const feedback = new Feedback({ user, rating, comments });
        await feedback.save();
        res.json({ message: "Thank you for your feedback!" });
    } catch (error) {
        console.error("❌ Feedback Error:", error.message);
        res.status(500).json({ error: "Failed to save feedback." });
    }
});

module.exports = router;
