const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config(); // To load environment variables (like OPENAI_API_KEY)
const connectDB = require("./config/db");
// MongoDB Models
const InstituteData = require("./models/InstituteData");
const FAQ = require("./models/FAQ");

// OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// MongoDB Connection
connectDB();

// Function to call OpenAI Chat API to generate FAQs
const generateFaqsUsingOpenAI = async (title, body) => {
    const prompt = `
    Generate meaningful FAQ questions and answers based on the following information about an institute:
    
    Title: ${title}
    Information: ${body}
    
    Format the response as:
    1. Question: <question>
       Answer: <answer>
    2. Question: <question>
       Answer: <answer>
    `;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant generating FAQs for an educational institute." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 1500,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("📌 OpenAI Response:\n", response.data.choices[0].message.content);

        const faqs = [];
const faqLines = response.data.choices[0].message.content.split("\n").filter((line) => line.trim() !== "");

let currentQuestion = "";
let currentAnswer = "";

// Parsing OpenAI output to extract questions and answers
for (const line of faqLines) {
    // Match lines like "1. Question: ..." or "Question: ..."
    const questionMatch = line.match(/^\s*\d*\.*\s*Question:\s*(.*)/i);
    const answerMatch = line.match(/^\s*Answer:\s*(.*)/i);

    if (questionMatch) {
        // If there's a previous question and answer, save them
        if (currentQuestion && currentAnswer) {
            faqs.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
        }
        currentQuestion = questionMatch[1].trim();
        currentAnswer = "";  // Reset answer for the new question
    } else if (answerMatch) {
        currentAnswer = answerMatch[1].trim();
    }
}

// Push the last question-answer pair if present
if (currentQuestion && currentAnswer) {
    faqs.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
}

console.log("📌 Parsed FAQs:", faqs);
return faqs;


    } catch (error) {
        console.error("❌ OpenAI API Error:", error.message);
        return [];
    }
};


// Main function to fetch institute data, generate FAQs, and save them to MongoDB
const generateAndSaveFaqs = async () => {
    try {
        console.log("🚀 Fetching institute data...");
        const institutes = await InstituteData.find();

        for (const institute of institutes) {
            console.log(`🔍 Generating FAQs for: ${institute.title}`);

            const faqs = await generateFaqsUsingOpenAI(institute.title, institute.body);

            for (const faq of faqs) {
                console.log(`✅ Saving FAQ to database: ${faq.question} -> ${faq.answer}`);
                await FAQ.create(faq);
                console.log(`✅ Successfully saved FAQ: ${faq.question}`);
            }
        }

        console.log("🎉 FAQ Generation Complete!");
    } catch (error) {
        console.error("❌ Error generating FAQs:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

// Execute the script
generateAndSaveFaqs();
